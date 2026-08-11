#!/usr/bin/env python3
"""Make a generated figure's flat canvas transparent.

Generated diagrams are line art on a single flat background, so this needs no
segmentation model: the background is exactly the region of near-uniform colour
connected to the image border. Flood filling inward from the edges removes it
while preserving interior panels and fills that happen to share the tone, and a
short feather band recovers the anti-aliased pixels along each stroke so edges
stay smooth instead of jagged.

Figures follow a source/generated split: raw art from the image pipeline lands
in a `source/` directory, and this writes the transparent version one level up,
under the same filename, which is what slides and posts reference. Point it at a
directory to process everything in it, and it skips art whose output is already
newer than its source.

    python3 scripts/remove-figure-background.py public/images/blog/<slug>/source
    python3 scripts/remove-figure-background.py path/to/one.png --tolerance 18
    python3 scripts/remove-figure-background.py path/to/one.png --edge-unmix
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

# How close a pixel must be to the sampled background to count as background.
# Generated art is flat, so this only needs to absorb compression noise.
DEFAULT_TOLERANCE = 12

# Width, in pixels, of the band around the removed region where anti-aliased
# stroke edges get partial alpha instead of a hard cut.
FEATHER_RADIUS = 2

# Edge unmixing looks only this far for the solid colour underneath an
# anti-aliased pixel. Keeping the search local prevents nearby labels and fills
# from donating colour to one another.
EDGE_UNMIX_RADIUS = 4
EDGE_UNMIX_PASSES = 2


def sample_background(rgb: np.ndarray) -> np.ndarray:
    """The most common colour along the border, which is the canvas."""
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    colours, counts = np.unique(border.reshape(-1, 3), axis=0, return_counts=True)
    return colours[counts.argmax()].astype(np.int16)


def flood_background(similar: np.ndarray) -> np.ndarray:
    """Background-like pixels reachable from the border (4-connected)."""
    height, width = similar.shape
    removed = np.zeros_like(similar, dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    for y in range(height):
        for x in (0, width - 1):
            if similar[y, x] and not removed[y, x]:
                removed[y, x] = True
                queue.append((y, x))
    for x in range(width):
        for y in (0, height - 1):
            if similar[y, x] and not removed[y, x]:
                removed[y, x] = True
                queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < height and 0 <= nx < width and similar[ny, nx] and not removed[ny, nx]:
                removed[ny, nx] = True
                queue.append((ny, nx))

    return removed


def neighbours(mask: np.ndarray) -> np.ndarray:
    """One step of 4-connected dilation."""
    grown = mask.copy()
    grown[1:, :] |= mask[:-1, :]
    grown[:-1, :] |= mask[1:, :]
    grown[:, 1:] |= mask[:, :-1]
    grown[:, :-1] |= mask[:, 1:]
    return grown


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    """Grow a mask by a small 4-connected radius."""
    grown = mask.copy()
    for _ in range(radius):
        grown = neighbours(grown)
    return grown


def local_foreground(
    rgb: np.ndarray,
    distance: np.ndarray,
    radius: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Find the highest-contrast nearby pixel as an edge's solid colour.

    Generated diagrams use flat fills and strokes. Within a small edge
    neighbourhood, the pixel farthest from the canvas is therefore a useful
    estimate of the colour before antialiasing mixed it with the canvas.
    """
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
    background: np.ndarray,
    distance: np.ndarray,
    removed: np.ndarray,
    alpha: np.ndarray,
    tolerance: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Remove canvas contamination and tighten only antialiased edge pixels."""
    foreground, foreground_distance = local_foreground(rgb, distance, EDGE_UNMIX_RADIUS)

    # Require a real local stroke or fill, and change only pixels that are less
    # solid than that local colour. Weak paper noise never becomes an edge.
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

    # At the exterior canvas boundary, store clean foreground RGB plus alpha.
    # This avoids compositing the old canvas twice on the slide background.
    exterior_zone = dilate(removed, EDGE_UNMIX_RADIUS)
    canvas = background.astype(np.float32)
    exterior_coverage, exterior_error, _ = solve_coverage(observed, solid, canvas)
    exterior = candidates & exterior_zone & (exterior_error <= maximum_error)
    output_rgb[exterior] = foreground[exterior]
    exterior_sharpened = sharpen_coverage(exterior_coverage)
    alpha[exterior] = np.round(exterior_sharpened[exterior] * 255).astype(np.uint8)

    # Interior labels may sit on panels rather than the outer canvas. A local
    # median removes narrow strokes while retaining the backing fill, so those
    # edges are unmixed against blue (or any other fill) instead of white.
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


def remove_background(
    image: Image.Image,
    tolerance: int,
    edge_unmix: bool = False,
) -> Image.Image:
    rgb = np.array(image.convert("RGB"), dtype=np.uint8)
    background = sample_background(rgb)

    distance = np.abs(rgb.astype(np.int16) - background).max(axis=2)
    removed = flood_background(distance <= tolerance)

    alpha = np.where(removed, 0, 255).astype(np.uint8)

    # Anti-aliased stroke edges sit just outside the flood region and are part
    # background by construction. Scaling their alpha by how far they are from
    # the canvas colour keeps strokes smooth on any paper they land on.
    band = neighbours(removed) & ~removed
    for _ in range(FEATHER_RADIUS - 1):
        band |= neighbours(band) & ~removed
    if band.any() and not edge_unmix:
        edge_alpha = np.clip(distance.astype(np.float32) / max(tolerance * 2, 1), 0, 1)
        alpha[band] = (edge_alpha[band] * 255).astype(np.uint8)

    if edge_unmix:
        rgb, alpha = unmix_edges(rgb, background, distance, removed, alpha, tolerance)

    out = np.dstack([rgb, alpha])
    return Image.fromarray(out, mode="RGBA")


def collect(paths: list[Path]) -> list[Path]:
    """Expand directories to the PNGs inside them."""
    sources: list[Path] = []
    for path in paths:
        sources.extend(sorted(path.glob("*.png")) if path.is_dir() else [path])
    return sources


def output_for(source: Path, out_dir: Path | None) -> Path:
    """Generated art sits one level up from `source/`, under the same name."""
    if out_dir is not None:
        return out_dir / source.name
    if source.parent.name == "source":
        return source.parent.parent / source.name
    return source.with_name(f"{source.stem}-transparent.png")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="PNG files, or directories of them")
    parser.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE)
    parser.add_argument("--out-dir", type=Path, default=None)
    parser.add_argument(
        "--edge-unmix",
        action="store_true",
        help="Remove old-canvas colour from antialiased edges and tighten their coverage",
    )
    parser.add_argument("--force", action="store_true", help="Rebuild art that is already current")
    args = parser.parse_args()

    for source in collect(args.paths):
        target = output_for(source, args.out_dir)
        if (
            not args.force
            and target.exists()
            and target.stat().st_mtime >= source.stat().st_mtime
        ):
            print(f"{source.name}: current")
            continue

        result = remove_background(Image.open(source), args.tolerance, args.edge_unmix)
        target.parent.mkdir(parents=True, exist_ok=True)
        result.save(target)

        cleared = int((np.array(result)[:, :, 3] == 0).sum())
        print(f"{source.name}: {cleared / (result.width * result.height):.0%} transparent -> {target}")


if __name__ == "__main__":
    main()
