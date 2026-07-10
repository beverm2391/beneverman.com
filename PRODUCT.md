# beneverman.com — product

Ben's personal home: an art-first landing page and a small, high-craft
technical blog under his own name. The landing, blog, and the development scene
lab live together here; the archived `beneverman.com-v7` is only historical
source material.

Work is tracked in Linear's **Personal Website** project. `PROMPT.md` owns local
development workflow. This file owns the product promise, proof status, and
open gates.

## The three surfaces

- **Landing (`/`)** — a server-rendered static introduction enhanced by the
  client-only WebGL sun and shadow scene. It must remain useful without
  JavaScript or WebGL.
- **Blog (`/blog`, `/blog/{slug}`)** — technical build-in-public posts compiled
  from MDX. Seeded placeholder posts are not content.
- **Scene lab (`/lab`, development only)** — the compositor used to author the
  landing. The production route is a 404, and the editor, its UI dependencies,
  and its CSS must not enter production client assets.

## Acceptance and current proof

### Landing

- Initial HTML contains the complete intro and stable shell. The production
  build fails if that server-rendered copy disappears.
- JavaScript progressively replaces the static shell with the live scene. A
  missing WebGL context leaves the same solid background and readable content.
- Reduced-motion freezes both the sun cycle and shader time. Data saver, slow
  connections, low memory/CPU, and low battery disable the expensive shadow
  layer.
- The live visual config comes from a validated scene snapshot in
  `scene/lab/promoted.json`. Promotion must fail loudly on malformed data; it
  must never fall back because a separate scene registry was not updated.

### Blog

- Posts are `.mdx` content with zod-validated frontmatter, discovered and
  compiled by the standard remark/rehype pipeline. There is no docs framework,
  CMS, content codegen, or hand-rolled Markdown parser.
- Posts statically generate from `generateStaticParams`. Shiki highlighting is
  build-time only, with one shared highlighter and a small language set.
- GFM tables and footnotes work. The component map is deliberately narrow.
- The index and canonical post routes are `/blog` and `/blog/{slug}`.
- Metadata includes canonical URLs, article fields, generated OG images, and
  Twitter cards. `/feed.xml`, `/sitemap.xml`, and `/robots.txt` are static.
- The deliberately retired published `minimalist-ai-agent` URL permanently
  redirects to `/blog`; ported Fumadocs posts kept their existing `/blog/*`
  paths, so they do not need redirects.
- The blog's visual design remains a Ben + Claude collaboration. Codex owns the
  mechanical plumbing, not unilateral visual redesign.

### Repository gates

- CI blocks on the repository line limit, ESLint errors, TypeScript, behavioral
  tests, and the production build.
- The build additionally asserts home SSR, lab client-asset exclusion, and RSS
  output. This is the regression proof for the product boundaries above.

## Open gates

1. **Finish the real content port.** The eye-disease article currently contains
   only the first ported section. Continue section by section with Ben and
   Claude because figures, captions, callouts, and the article's visual rhythm
   require interactive design decisions.
2. **Finish long-form affordances.** Before the completed long post ships, add
   the promised long-form TOC, copy-code interaction, and an optimized-image
   treatment. These are not present today and should not be marked complete by
   inference.
3. **Cut over deliberately.** After the content/design gates close, verify the
   deployed domain, redirects, feed, metadata, no-WebGL state, and reduced-motion
   state before retiring the old site.

## Non-goals

No search, sidebar/doc tree, CMS, comments, versioning, or i18n. A content layer
is only worth adding if post count makes the current build path measurably
painful. Mermaid and video embeds remain possible future components, not v1
requirements.

The old post source remains local at
`~/Documents/Code/web/beneverman.com-v6-fumadocs`. The
`minimalist-ai-agent` post is intentionally retired, not awaiting porting.
