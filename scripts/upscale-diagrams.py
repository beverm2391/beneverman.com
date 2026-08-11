#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "fal-client>=0.7",
#   "numpy>=1.26",
#   "pillow>=10",
# ]
# ///
"""Batch upscale flat technical diagrams through Topaz and edge unmixing.

The provider output remains untouched as the canonical upscale. Derived files
are resized to the requested canvas, made transparent with the project's border
flood fill, and composited onto the project paper for inspection.

Run with the scoped FAL secret:

    b secrets run --project main-v1 --config dev --secret FAL_API_KEY -- \
      uv run scripts/upscale-diagrams.py source/*.png --out-dir review/upscaled
"""

from __future__ import annotations

import argparse
import importlib.util
import os
import sys
import urllib.request
from pathlib import Path
from types import ModuleType

import fal_client
import numpy as np
from PIL import Image, ImageFilter

DEFAULT_MODEL = "CGI"
DEFAULT_SHARPEN = 0.8
DEFAULT_DENOISE = 0.0
DEFAULT_TARGET = (3840, 2160)
DEFAULT_PAPER = "#faf9f6"
SUPPORTED_MODELS = ("CGI", "Text Refine")
EDGE_UNMIX_RADIUS = 4
EDGE_UNMIX_PASSES = 2


def load_background_module() -> ModuleType:
    """Load the existing flood-fill implementation without duplicating it."""
    path = Path(__file__).with_name("remove-figure-background.py")
    spec = importlib.util.spec_from_file_location("figure_background", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {path}")
    module = importlib.util.module_from_spec(spec)
    prior_bytecode_setting = sys.dont_write_bytecode
    sys.dont_write_bytecode = True
    try:
        spec.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = prior_bytecode_setting
    return module


def unit_float(value: str) -> float:
    parsed = float(value)
    if not 0 <= parsed <= 1:
        raise argparse.ArgumentTypeError("must be between 0 and 1")
    return parsed


def strength_float(value: str) -> float:
    parsed = float(value)
    if not 0.01 <= parsed <= 1:
        raise argparse.ArgumentTypeError("must be between 0.01 and 1")
    return parsed


def upscale_float(value: str) -> float:
    parsed = float(value)
    if not 1 <= parsed <= 4:
        raise argparse.ArgumentTypeError("must be between 1 and 4")
    return parsed


def target_size(value: str) -> tuple[int, int]:
    try:
        width, height = (int(part) for part in value.lower().split("x", 1))
    except (TypeError, ValueError) as error:
        raise argparse.ArgumentTypeError("must look like 3840x2160") from error
    if width <= 0 or height <= 0:
        raise argparse.ArgumentTypeError("dimensions must be positive")
    return width, height


def collect(paths: list[Path]) -> list[Path]:
    sources: list[Path] = []
    for path in paths:
        sources.extend(sorted(path.glob("*.png")) if path.is_dir() else [path])
    missing = [path for path in sources if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Input does not exist: {missing[0]}")
    return sources


def fit_canvas(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Fill a canvas without stretching, then remove only the center overflow."""
    target_width, target_height = size
    scale = max(target_width / image.width, target_height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_width) // 2
    top = (resized.height - target_height) // 2
    return resized.crop((left, top, left + target_width, top + target_height))


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    """Grow a mask by a small 4-connected radius."""
    grown = mask.copy()
    for _ in range(radius):
        source = grown.copy()
        grown[1:, :] |= source[:-1, :]
        grown[:-1, :] |= source[1:, :]
        grown[:, 1:] |= source[:, :-1]
        grown[:, :-1] |= source[:, 1:]
    return grown


def local_foreground(
    rgb: np.ndarray,
    distance: np.ndarray,
    radius: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Find the highest-contrast nearby pixel as an edge's solid colour."""
    height, width = distance.shape
    best_distance = distance.copy()
    best_rgb = rgb.copy()

    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if abs(dy) + abs(dx) > radius or (dy == 0 and dx == 0):
                continue

            dst_y0 = max(0, -dy)
            dst_y1 = min(height, height - dy)
            dst_x0 = max(0, -dx)
            dst_x1 = min(width, width - dx)
            src_y0 = dst_y0 + dy
            src_y1 = dst_y1 + dy
            src_x0 = dst_x0 + dx
            src_x1 = dst_x1 + dx

            candidate_distance = distance[src_y0:src_y1, src_x0:src_x1]
            current_distance = best_distance[dst_y0:dst_y1, dst_x0:dst_x1]
            better = candidate_distance > current_distance
            if not better.any():
                continue

            current_distance[better] = candidate_distance[better]
            candidate_rgb = rgb[src_y0:src_y1, src_x0:src_x1]
            current_rgb = best_rgb[dst_y0:dst_y1, dst_x0:dst_x1]
            current_rgb[better] = candidate_rgb[better]

    return best_rgb, best_distance


def solve_coverage(
    observed: np.ndarray,
    foreground: np.ndarray,
    backing: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Solve observed = coverage * foreground + (1 - coverage) * backing."""
    direction = foreground - backing
    denominator = np.square(direction).sum(axis=2)
    coverage = np.divide(
        ((observed - backing) * direction).sum(axis=2),
        denominator,
        out=np.zeros_like(denominator, dtype=np.float32),
        where=denominator > 0,
    )
    coverage = np.clip(coverage, 0, 1)
    reconstructed = backing + coverage[:, :, None] * direction
    error = np.abs(observed - reconstructed).max(axis=2)
    return coverage, error, direction


def sharpen_coverage(coverage: np.ndarray) -> np.ndarray:
    """Tighten an edge while preserving its 50% contour."""
    sharpened = coverage
    for _ in range(EDGE_UNMIX_PASSES):
        sharpened = sharpened * sharpened * (3 - 2 * sharpened)
    return sharpened


def unmix_edges(
    rgb: np.ndarray,
    canvas: np.ndarray,
    distance: np.ndarray,
    removed: np.ndarray,
    alpha: np.ndarray,
    tolerance: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Remove canvas contamination and tighten only antialiased edge pixels."""
    foreground, foreground_distance = local_foreground(rgb, distance, EDGE_UNMIX_RADIUS)
    minimum_contrast = max(tolerance * 4, 48)
    candidates = (
        ~removed
        & (foreground_distance >= minimum_contrast)
        & (distance < foreground_distance)
    )
    if not candidates.any():
        return rgb, alpha

    observed = rgb.astype(np.float32)
    solid = foreground.astype(np.float32)
    output_rgb = rgb.copy()
    maximum_error = max(tolerance * 2, 24)

    # Exterior pixels become clean foreground plus alpha, avoiding a second
    # mix with the old canvas when the result lands on the slide paper.
    exterior_zone = dilate(removed, EDGE_UNMIX_RADIUS)
    exterior_coverage, exterior_error, _ = solve_coverage(
        observed,
        solid,
        canvas.astype(np.float32),
    )
    exterior = candidates & exterior_zone & (exterior_error <= maximum_error)
    output_rgb[exterior] = foreground[exterior]
    exterior_sharpened = sharpen_coverage(exterior_coverage)
    alpha[exterior] = np.round(exterior_sharpened[exterior] * 255).astype(np.uint8)

    # Interior labels can sit on coloured panels. The median recovers that
    # local backing so edge cleanup does not introduce a white outline.
    median_size = EDGE_UNMIX_RADIUS * 2 + 1
    local_backing = np.array(
        Image.fromarray(rgb).filter(ImageFilter.MedianFilter(size=median_size)),
        dtype=np.float32,
    )
    enclosed_coverage, enclosed_error, enclosed_direction = solve_coverage(
        observed,
        solid,
        local_backing,
    )
    local_contrast = np.abs(enclosed_direction).max(axis=2)
    enclosed = (
        candidates
        & ~exterior_zone
        & (local_contrast >= minimum_contrast)
        & (enclosed_error <= maximum_error)
    )
    enclosed_sharpened = sharpen_coverage(enclosed_coverage)
    composited = local_backing + enclosed_sharpened[:, :, None] * enclosed_direction
    output_rgb[enclosed] = np.clip(np.round(composited[enclosed]), 0, 255).astype(np.uint8)
    return output_rgb, alpha


def edge_unmix(
    image: Image.Image,
    tolerance: int,
    background: ModuleType,
) -> Image.Image:
    """Apply the upscale-only edge pass using the shared flood-fill mask."""
    rgb = np.array(image.convert("RGB"), dtype=np.uint8)
    canvas, distance, removed = background.background_mask(rgb, tolerance)
    alpha = np.where(removed, 0, 255).astype(np.uint8)
    rgb, alpha = unmix_edges(rgb, canvas, distance, removed, alpha, tolerance)
    return Image.fromarray(np.dstack([rgb, alpha]), mode="RGBA")


def topaz_request(args: argparse.Namespace, image_url: str) -> dict[str, object]:
    request: dict[str, object] = {
        "model": args.model,
        "upscale_factor": args.upscale_factor,
        "crop_to_fill": False,
        "image_url": image_url,
        "output_format": "png",
        "face_enhancement": False,
        "sharpen": args.sharpen,
        "denoise": args.denoise,
    }
    if args.model == "Text Refine":
        request["fix_compression"] = args.fix_compression
        request["strength"] = args.strength
    return request


def settings_slug(args: argparse.Namespace) -> str:
    model = args.model.lower().replace(" ", "-")
    parts = [model, f"sharp-{args.sharpen:g}", f"denoise-{args.denoise:g}"]
    if args.model == "Text Refine":
        parts.extend(
            [
                f"compression-{args.fix_compression:g}",
                f"strength-{args.strength:g}",
            ]
        )
    return "-".join(parts)


def run_topaz(source: Path, target: Path, args: argparse.Namespace) -> None:
    image_url = fal_client.upload_file(str(source))
    result = fal_client.subscribe(
        "fal-ai/topaz/upscale/image",
        arguments=topaz_request(args, image_url),
    )
    urllib.request.urlretrieve(result["image"]["url"], target)


def process(source: Path, args: argparse.Namespace, background: ModuleType) -> None:
    output = args.out_dir / source.stem / settings_slug(args)
    model_slug = args.model.lower().replace(" ", "-")
    provider = output / f"01-topaz-{model_slug}.png"
    canvas = output / f"02-{args.target[0]}x{args.target[1]}.png"
    transparent = output / f"03-{args.target[0]}x{args.target[1]}-edge-unmixed.png"
    proof = output / f"04-{args.target[0]}x{args.target[1]}-on-paper.png"

    if args.dry_run:
        print(f"{source} -> {output}")
        print(f"  Topaz request: {topaz_request(args, '<uploaded input>')}")
        return

    output.mkdir(parents=True, exist_ok=True)
    if args.force or not provider.exists():
        run_topaz(source, provider, args)
        print(f"{source.name}: saved Topaz output")
    else:
        print(f"{source.name}: using existing Topaz output")

    fitted = fit_canvas(Image.open(provider).convert("RGB"), args.target)
    fitted.save(canvas)

    result = edge_unmix(
        fitted,
        args.tolerance,
        background,
    )
    result.save(transparent)

    paper = Image.new("RGB", args.target, args.paper)
    paper.paste(result, mask=result.getchannel("A"))
    paper.save(proof)
    print(f"{source.name}: saved canvas, transparent output, and paper proof -> {output}")


def parser() -> argparse.ArgumentParser:
    parse = argparse.ArgumentParser(description=__doc__)
    parse.add_argument("paths", nargs="+", type=Path, help="PNG files or directories")
    parse.add_argument("--out-dir", type=Path, required=True)
    parse.add_argument("--model", choices=SUPPORTED_MODELS, default=DEFAULT_MODEL)
    parse.add_argument("--upscale-factor", type=upscale_float, default=2.0)
    parse.add_argument("--sharpen", type=unit_float, default=DEFAULT_SHARPEN)
    parse.add_argument("--denoise", type=unit_float, default=DEFAULT_DENOISE)
    parse.add_argument("--fix-compression", type=unit_float, default=0.0)
    parse.add_argument("--strength", type=strength_float, default=0.5)
    parse.add_argument("--target", type=target_size, default=DEFAULT_TARGET)
    parse.add_argument("--paper", default=DEFAULT_PAPER)
    parse.add_argument("--tolerance", type=int, default=None)
    parse.add_argument("--force", action="store_true", help="Replace existing provider outputs")
    parse.add_argument("--dry-run", action="store_true", help="Print work without API calls")
    return parse


def main() -> None:
    args = parser().parse_args()
    background = load_background_module()
    if args.tolerance is None:
        args.tolerance = background.DEFAULT_TOLERANCE

    if not args.dry_run:
        if "FAL_KEY" not in os.environ and "FAL_API_KEY" in os.environ:
            os.environ["FAL_KEY"] = os.environ["FAL_API_KEY"]
        if "FAL_KEY" not in os.environ:
            raise SystemExit(
                "FAL_API_KEY is missing. Run through `b secrets run` as shown in --help."
            )

    sources = collect(args.paths)
    if not sources:
        raise SystemExit("No PNG inputs found")
    for source in sources:
        process(source, args, background)


if __name__ == "__main__":
    main()
