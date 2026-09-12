# Image requests

One file per figure, written for whoever generates the art. `00-style-contract.md`
holds everything shared, so a request only has to describe its own drawing.

A request states what the figure has to make the viewer understand, then what to
draw. Figures here are load bearing: each one carries a step of the argument, so
the intent matters more than the styling.

This directory is a work queue, not a manifest of finished figures. After Ben
selects and integrates a candidate, delete its request file. The public
asset and the code that renders it own the final state. The external review
packet preserves the unselected candidates and the generation history. Do not
keep a request-to-final mapping here.

After art lands in `public/images/blog/<slug>/source/`:

```
python3 scripts/remove-figure-background.py public/images/blog/<slug>/source
```

That writes the transparent version one level up, under the same filename, which
is what slides and posts reference. It skips anything already current, so
re-running is cheap.
