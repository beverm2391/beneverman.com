# The diagram renderer

A mermaid fence in a post becomes an inline SVG before the site ever ships. No
mermaid reaches the reader, nothing renders after load, and no-JS visitors see
the same diagram as everyone else. The diagram is painted in the site's own
colour tokens and measured in the site's own font, so it reads as part of the
page rather than as a picture pasted onto it.

That last sentence is the whole design, and everything below is what it costs.

## Why the browser is not optional

Mermaid is a layout engine before it is a renderer. To place `A --> B` it has to
know how wide "call LLM" actually is, because the label determines the box, the
box determines the node, and the nodes determine every edge around them. The
only thing that can answer "how wide is this text in this font" is a real text
engine, so mermaid builds actual SVG nodes in a DOM and calls `getBBox()` on
them.

There is no way around this. jsdom, linkedom and happy-dom all parse the markup
and then return zeros, because none of them do layout. Mermaid has no headless
mode and the upstream issues asking for one have stayed open for years. If you
want mermaid, you want a browser, and the only real choice is whose machine runs
it: the reader's, or the build's. We chose the build's.

`lib/blog.ts` owns the pipeline. `lib/mermaid-theme.ts` owns everything the
renderer needs to know about this site.

## One SVG that works in both themes

The interesting property of mermaid is that it paints entirely through CSS. Its
generated stylesheet carries every colour it uses and it emits no inline `fill`
or `stroke` attributes at all. That is worth stating as a measured fact rather
than a belief: rendering a flowchart and counting inline paint attributes gives
zero, across 33 colour-bearing rules.

So the site hands mermaid its own tokens through `themeCSS`, and the compiled
SVG carries `var(--surface)`, `var(--fg)`, `var(--muted)` and `var(--border)`
instead of literal colours. Those variables resolve against the page, and the
page already re-resolves them under `.dark`. One compiled artifact, correct in
both themes, with no second render and no CSS swap.

Two things make this work and both are easy to get wrong.

`theme: "base"` is required. Every other mermaid theme bakes opinionated colours
that resist overriding, which is why the old setup ended up picking
`lineColor: "#8a8a8a"` by hand: a single grey chosen to survive both themes
because the node fills could not be moved at all. Under the old renderer every
diagram in dark mode was a light rectangle sitting on a dark card.

`themeVariables` cannot do this job. Mermaid runs colour maths over those values
to derive its palette, and `var(--token)` is not a colour it can lighten or
darken. `themeCSS` is the only door.

## Measuring the font the reader actually gets

Since mermaid sizes nodes by measuring labels, the render page has to resolve
the same font the reader will see. Get this wrong and the failure is quiet and
ugly: measure a fallback, ship Geist, and every label overflows the box that was
computed for it. Labels come out as "quer", "final answ", "+name: strin".

`mermaid-isomorphic` takes a `css` option whose stated purpose is loading custom
fonts, so the render page loads the real `geist-latin.woff2` out of `public/`.
`lib/mermaid-geist.css` exists only for that, and its `src` is relative on
purpose, because the file is added to the page by URL and the woff2 has to
resolve next to it on any machine.

This is the part that earns the browser. A real text engine measuring the real
font is not an approximation of Geist, it is Geist.

## Two Chromiums, for two different machines

`pnpm build` installs Chromium itself rather than documenting it as a
prerequisite, because a missing browser does not crash the build. It fails the
MDX compile, the page falls back to `notFound()`, and the post prerenders as a
404 artifact while the build reports success. That is exactly how the teeny
agent post once shipped as a dead URL. `scripts/verify-production-build.mjs`
now asserts that every prerendered post is a real article, which is what turns
this class of failure from invisible into loud.

Vercel needs a different browser than a laptop does. Playwright's own download
lands there and then refuses to launch, because the build image has no
`libnspr4.so` and there is no root to run `playwright install-deps`. So Vercel
gets `@sparticuz/chromium`, which bundles what it needs, and the laptop keeps
playwright's chromium, which is already present and faster. `mermaidLaunchOptions()`
picks between them on `process.env.VERCEL`, and the install step skips itself
there for the same reason.

The whole Vercel build, including rendering twelve diagrams, takes about 42
seconds.

## What we did not build

The alternative worth knowing about is `beautiful-mermaid`, a from-scratch
reimplementation that lays out with ELK and needs no browser at all. It was
spiked here and rejected, but not for the obvious reason.

Its theming was genuinely good and it solved dark mode the same way we ended up
solving it. What it could not do was measure. It estimates text width from
character-class buckets tuned around Inter, which is a guess about Geist rather
than a measurement of it. It also emits no accessibility markup whatsoever, no
`title`, no `desc`, no `role`, where mermaid gives all of it for free. It covers
six diagram types against mermaid's twelve, and it has shipped nothing since
February 2026.

Rendering each diagram twice, once light and once dark, was the other candidate.
It is unnecessary: mermaid paints through CSS, so one SVG already adapts. It
would have doubled the bytes and the render time to buy nothing.

## What is still open

Flowchart, class and ER are clean. Sequence, state, gantt, pie, gitGraph,
mindmap, timeline and quadrant still paint some of mermaid's own colours,
visible as cream shapes or invisible dark labels on a dark card.

Leave them. The rule is to theme a diagram type when a post first uses that
type, not before, and the gallery is a sandbox rather than a promise. Half of
those are categorical-colour diagrams anyway, where a pie chart wants distinct
slices, so what they should look like here is a design decision waiting on a
real use rather than a selector someone forgot.

Accessibility is authoring, not code. Mermaid compiles `accTitle:` and
`accDescr:` in a fence into a real `title` and `desc` with `aria-labelledby` and
`aria-describedby`. Nothing needs building. The diagrams just need someone to
write them.

## When it breaks

A post that fails to compile 404s instead of crashing, so the symptom is a
missing page rather than a stack trace. The build verifier catches it, the dev
server logs it loudly from `getBlogPost`, and the message is usually the real
cause. Chromium problems say so plainly, either that the executable does not
exist or that a shared library is missing.

Drafts render locally and on Vercel previews, never in production. That means a
draft with a broken diagram fails its own preview rather than waiting to
surface on the day it ships, and the gallery at `/blog/mermaid-gallery` is the
place to look at all twelve types in both themes.
