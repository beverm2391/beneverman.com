# Homepage scene inspiration

Working brief for the next homepage scene (dither / halftone / scanline
direction), curated from Ben's references. This is a design input for lab
work, not documentation: add new references as entries with a "steal" note,
delete ones that stop earning their place.

## The direction

Ink and paper stay — the site is flat cream (`--bg`) with near-black ink, and
dark mode inverts it. The new scene is a **form constructed from dither and
scanline slats**, drawn in the page's own two inks: ink-on-cream in light,
cream-on-ink in dark (the logo references below are exactly our dark
palette). The form is the artifact; the texture is the technique.

Vocabulary:

- Ordered (Bayer-style) dither and horizontal scanline slats are the only
  texture moves. A form exists because rows of slats are interrupted at its
  silhouette — see the Record/Cathedral marks.
- Two inks only. No third color, no gradients that aren't carried by the
  pattern density itself.
- Mono uppercase microtype as chrome (coordinates, statuses, slashes) — the
  industrial spec-sheet register, used sparingly.
- Motion, if any, is slow and analog: pattern-phase shimmer, a form slowly
  rotating, density breathing. Theme toggle can re-ink the whole scene.

Not this: photographic dither subjects, neon/CRT nostalgia, glitch effects,
scan distortion, anything that fights the intro copy for attention.

## References

### OpenAI "Emergence" brand exploration — @jeffinvenice

<https://x.com/jeffinvenice/status/2029635499854589971> (2026-03-05)
Image: <https://pbs.twimg.com/media/HCq2m0bbAAAbZHU.jpg>

Two dark event-ticket cards: ASCII-dithered globe, mono all-caps type blocks,
hairline rules, barcode footer. **Steal:** the ASCII/character dither as a way
to render a large form; the ticket's restraint — one textured artifact, then
plain type; cream-on-near-black contrast level (never pure white).

### Minimal type design — @kyleanthony

<https://x.com/kyleanthony/status/2018675476470915216> (2026-02-03)
Image: <https://pbs.twimg.com/media/HAPGnrWWIAAa23T.jpg>

Cream paper, black mono/grotesk all-caps spec-sheet compositions: statuses,
coordinates, slashes, small glyph marks, solid black chips. **Steal:** this is
our light mode's register — the microtype chrome vocabulary (`>`, `/`,
`STATUS: ACTIVE`), and the confidence of large empty cream fields.

### "People yearn for ascii and dither" — @almmaasoglu

<https://x.com/almmaasoglu/status/2013987651406254520> (2026-01-21)
Image: <https://pbs.twimg.com/media/G_MfFk9XYAEKGzW.jpg>

Bayer-dithered photographic figure + ASCII-dither panel on black. **Steal:**
the dither cell scale — coarse enough to be legible AS dither from reading
distance; how two dither styles (dot vs character) sit side by side. **Avoid:**
the photographic subject and the third color; our forms stay geometric.

### Scanline logo system — @kyleanthony

<https://x.com/kyleanthony/status/2022306835768746055> (2026-02-13)
Images: Synthetic <https://pbs.twimg.com/media/HBCtTZVaMAAqHwo.png> ·
Helix-DB <https://pbs.twimg.com/media/HBCtTWrboAE7CwO.png> ·
Record <https://pbs.twimg.com/media/HBCtTYNbQAAh_vM.png> ·
Cathedral <https://pbs.twimg.com/media/HBCtTY1akAMwQhS.png>

Cream-on-near-black marks built entirely from horizontal slats with jittered
interruptions: an S, a helix, a sphere-with-core, a globe. **Steal:** the core
construction — silhouette × slat rows × per-row phase jitter = the mark. The
Record/Cathedral spheres are the strongest homepage-form candidates (they
rhyme with the old sun without being a sundial). Slat height and gap are the
key ratios to study.

## Lab implications

Candidate layers to prototype (each its own lab layer so they stack/A-B):

1. **Slat-form layer**: SDF silhouette (sphere first) rendered as horizontal
   slat rows with per-row interruption jitter; uniforms for slat height, gap,
   jitter, rotation/phase speed. The Record/Cathedral look, alive.
2. **Dither-field layer**: ordered-dither rendering of a slow scalar field
   (the old fbm gradient is a fine field source) — density carries the light.
3. **Microtype chrome**: DOM/CSS, not shader — spec-sheet corner labels in
   JetBrains Mono. Server-rendered like all page content.
