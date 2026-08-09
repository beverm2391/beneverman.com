#!/usr/bin/env python3
"""Make a generated figure's flat canvas transparent.

Generated diagrams are line art on a single flat background, so this needs no
segmentation model: the background is exactly the region of near-uniform colour
connected to the image border. Flood filling inward from the edges removes it
while preserving interior panels and fills that happen to share the tone, and a
short feather band recovers the anti-aliased pixels along each stroke so edges
stay smooth instead of jagged.

    python3 scripts/remove-figure-background.py public/images/foo.png
    python3 scripts/remove-figure-background.py public/images/*.png --tolerance 18

Writes <name>-transparent.png beside the source unless --in-place is given.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

# How close a pixel must be to the sampled background to count as background.
# Generated art is flat, so this only needs to absorb compression noise.
DEFAULT_TOLERANCE = 12

# Width, in pixels, of the band around the removed region where anti-aliased
# stroke edges get partial alpha instead of a hard cut.
FEATHER_RADIUS = 2


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


def remove_background(image: Image.Image, tolerance: int) -> Image.Image:
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
    if band.any():
        edge_alpha = np.clip(distance.astype(np.float32) / max(tolerance * 2, 1), 0, 1)
        alpha[band] = (edge_alpha[band] * 255).astype(np.uint8)

    out = np.dstack([rgb, alpha])
    return Image.fromarray(out, mode="RGBA")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE)
    parser.add_argument("--in-place", action="store_true")
    args = parser.parse_args()

    for path in args.paths:
        image = Image.open(path)
        result = remove_background(image, args.tolerance)
        target = path if args.in_place else path.with_name(f"{path.stem}-transparent.png")
        result.save(target)

        cleared = int((np.array(result)[:, :, 3] == 0).sum())
        total = result.width * result.height
        print(f"{path.name}: {cleared / total:.0%} transparent -> {target.name}")


if __name__ == "__main__":
    main()
