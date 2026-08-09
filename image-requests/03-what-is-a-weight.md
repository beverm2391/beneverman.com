# Figure 03, what a weight is

`03-what-is-a-weight.png`

Answers "what is a weight" for people who use chatbots daily and have never
thought about what is inside one. It has to end on the weights being a file,
because the whole talk turns on having that file.

Three panels, left to right, connected by thin arrows.

## Panel 1, ONE UNIT

A labeled equation, not a box diagram. Set large and centered in the panel:

```
Y = WX + B
```

Thin leader lines from each symbol to a mono uppercase label:

- `Y` to `OUTPUT`
- `W` to `THE WEIGHT`
- `X` to `INPUT`
- `B` to `THE BIAS`

Under it, one small line: `THE SAME Y = MX + B FROM SCHOOL.`

The panel walks from the line equation everyone learned to the term of art, so
the word "weight" ends up attached to a symbol.

## Panel 2, ONE LAYER

The same quantity stacked: an input vector times a matrix labeled `W` equals an
output vector. Draw the matrix as one continuous grid, not separate floating
tiles, so a layer reads as a single object.

Caption: `A LAYER IS A GRID OF THESE NUMBERS.`

## Panel 3, THE FILE

The layer shown as a file on disk: an isometric stack of sheets, labeled
`QWEN3.8.SAFETENSORS` with `400 GB` beneath. The stack matters, it carries that
the file holds many layers, which is what figure 04 then feeds text through.

Caption: `THE WEIGHTS ARE THE NUMBERS.`

No accent color anywhere in this figure. Nothing here constrains the user yet.

## Status

Three variants delivered. Variant 3, blueprint assembly, chosen for its
continuous grid and stacked file. Variant 2 had `m × b` in the unit, which is
wrong, the formula is `y = mx + b`. This request is the revision of variant 3.
