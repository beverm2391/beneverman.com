# Figure style contract

Applies to every figure request in this folder. Individual requests describe
only the drawing; everything here is assumed.

## Look

Technical blueprint line art, isometric or flat schematic, in the register of
an engineering drawing.

## Canvas

Flat, uniform, any single solid color. The canvas is removed automatically by
`scripts/remove-figure-background.py`, so it does not need to match the deck.
What matters:

- No gradients, vignettes, paper texture, drop shadows, or rounded card
  backgrounds. Those defeat the flood fill.
- Nothing in the drawing may touch the image border. Leave a clear margin, or
  the fill leaks into the artwork.
- Enclosed light fills within ~12 of the canvas color read as background where
  they connect to the edge. Make intentional fills clearly distinct.
- Anti-aliased strokes are fine, edges get feathered alpha automatically.

## Inks

| Role | Hex | Use |
| --- | --- | --- |
| Working ink | `#3c6af4` | Structure, strokes, leader lines, most labels |
| Pale fill | `#aabff8` | Light fills inside shapes |
| Neutral ink | `#262626` | Labels that are not annotations |
| Accent | `#e8735a` | The one element that controls or constrains the user |

The accent is semantic, not decorative. It marks a chokepoint, a gate, or a
harm. If nothing in the figure does that, the figure has no accent at all.
Spending it on a neutral object destroys its meaning everywhere else.

## Labels

Mono uppercase, generously letterspaced, attached to their subject with thin
leader lines.

## Output

- 16:9, roughly 1672x941.
- Save to `public/images/blog/<slug>/source/`. The parent directory is
  generated output and gets overwritten.
- When exploring, emit numbered variants of the same request
  (`03-1-…`, `03-2-…`) so we can pick one.
