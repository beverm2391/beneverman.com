# Figure 09, how a chatbot works

`09-how-chatbots-work.png`

The generic pipeline for the "How do chatbots work?" beat, with a real
example flowing through it. The audience should recognize their own daily
action — type a question, get an answer — and see the middle of it for the
first time: numbers in, math on a grid of numbers, numbers out. Backs the
slide immediately after the bullets that say the same thing in words. A
code-native placeholder currently holds the slide; this figure replaces it.

## Composition

A single left-to-right pipeline:

```
YOUR PROMPT  ->  TOKENIZATION  ->  [ THE MODEL ]  ->  DECODING  ->  RESPONSE
```

- `YOUR PROMPT`: a text bubble containing a real question, exactly:
  "Why is the sky blue?"
- First arrow labelled `TOKENIZATION`, with the intermediate representation
  riding under it in small mono: `[3446, 318, 262, ...]`
- `THE MODEL`: the central block and subject of the figure. Inside it, a
  square weight matrix drawn the way a paper would draw one: a grid of small
  signed decimal numbers (e.g. 0.12, -1.40, 0.87) with ellipses on the last
  row and column to imply billions more. Label the matrix `THE WEIGHTS`.
  Draw the matrix as one continuous grid, the same motif as figure 03
  panel 2, so the figures read as the same object.
- Second arrow labelled `DECODING`.
- `RESPONSE`: a text bubble containing a real answer, exactly:
  "Sunlight scatters in the air — blue scatters most."

Text fidelity matters more than usual here: the example sentences and the
matrix digits must be crisply legible, since the numbers are the point.

No accent color anywhere. Nothing in this figure constrains the user; it is
pure mechanism.
