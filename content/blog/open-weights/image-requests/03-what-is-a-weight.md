# Figure 03, what a weight is

`03-what-is-a-weight.png`

Answers "what is a weight" for people who use chatbots daily and have never
thought about what is inside one. It has to end on the weights being a file,
because the whole talk turns on having that file.

Three panels, left to right, connected by thin arrows. Label the progression:

```
ONE AFFINE FUNCTION  ->  MATRIX MULTIPLICATION  ->  WEIGHTS
```

## Panel 1, ONE AFFINE FUNCTION

A compact affine-function schematic:

```
X  ->  [ x m ]  [ + b ]  ->  Y
```

Thin leader lines label `m` as `THE WEIGHT` and `b` as `THE BIAS`.

The separate annotated `Y = WX + B` explanation does not belong in this
composition. It will be its own figure request.

## Panel 2, MATRIX MULTIPLICATION

The same quantity stacked: an input vector times a matrix labeled `W` equals an
output vector. Draw the matrix as one continuous grid, not separate floating
tiles, so a layer reads as a single object.

## Panel 3, WEIGHTS

The layer shown as a file on disk: an isometric stack of sheets labeled
`MODEL.SAFETENSORS`. The stack matters. It shows that the file holds many
layers, which is what figure 04 then feeds text through.

Do not add bottom captions or a file size anywhere in the composition.

No accent color anywhere in this figure. Nothing here constrains the user yet.

## Status

Three variants delivered. Variant 3, blueprint assembly, was chosen for its
continuous grid and stacked file. This request is the revision of variant 3.
