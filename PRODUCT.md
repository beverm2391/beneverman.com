# beneverman.com — product

Ben's personal home: an art-first landing page with distinct spaces for
technical posts and ongoing research. The public writing surfaces and the
development scene lab live together here; the archived `beneverman.com-v7` is
only historical source material.

Work is tracked in Linear's **Personal Website** project. `PROMPT.md` owns local
development workflow. This file owns the product promise, proof status, and
open gates.

## The five surfaces

- **Landing (`/`)** — a server-rendered static introduction enhanced by the
  client-only WebGL sun and shadow scene. It must remain useful without
  JavaScript or WebGL.
- **Direction (`/direction`)** — an evergreen, deliberately non-rigid account
  of what Ben is building toward, sourced separately from dated blog posts.
- **Blog (`/blog`, `/blog/{slug}`)** — technical build-in-public posts compiled
  from MDX. Seeded placeholder posts are not content.
- **Research (`/research`, `/research/{slug}`)** — working scientific models,
  experiments, and trajectories. It uses a separate paper-style presentation
  while sharing the site's MDX compiler and publication policy.
- **Scene lab (`/lab`, development only)** — the compositor used to author the
  landing. The production route is a 404, and the editor, its UI dependencies,
  and its CSS must not enter production client assets.

## Acceptance and current proof

### Landing

- Initial HTML contains the complete intro, the sun indicator, and a stable
  full-bleed shell. The production build fails if that server-rendered copy
  disappears.
- The WebGL scene is additive decoration behind the content: each layer fades
  in only after its first frame is GPU-verified, with no timers, placeholders
  imitating the shaders, or flash states. A missing WebGL context leaves the
  same flat page and readable content. The load ladder is measurable via
  `performance.mark` (`scene:*-live`, `scene:arrival`).
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
- Metadata includes canonical URLs, article fields, generated OG images, Twitter
  cards carrying Ben's handle, and JSON-LD. `/feed.xml`, `/sitemap.xml`, and
  `/robots.txt` are static. `updated` is optional and stays unset unless a post
  is genuinely revised: a modified date is an editorial claim, not a record of
  when the file last changed.
- One `status` field per post, defaulting to `draft`, decides what a URL does.
  A draft 404s in production because it was never public. An archived post
  redirects to `/blog` (307) because it was, and links to it exist: that is the
  deliberately retired `minimalist-ai-agent`. Ported Fumadocs posts kept their
  `/blog/*` paths, so they need no redirects.
- The blog's visual design remains a Ben + Claude collaboration. Codex owns the
  mechanical plumbing, not unilateral visual redesign.

### Research

- Research is a separate publication type, not a blog frontmatter skin. Its
  content lives under `content/research`, and its canonical URLs live under
  `/research`.
- The nested route layout owns the white-paper surface, Lora reading type,
  wider figures, and left sticky table of contents. Its CSS stays scoped under
  `.research-route`; the normal blog keeps its existing presentation.
- Research and Blog share frontmatter validation, draft/archive semantics, the
  MDX compiler, Shiki, Mermaid, and MDX components. They do not maintain
  parallel parsing or publishing systems.

### Direction

- The page uses the same build-time MDX renderer and content styling as the
  blog without inheriting blog frontmatter, status, discovery, or feed policy.
- Its language states a direction rather than presenting a fixed decade-long
  roadmap.

### Repository gates

- CI reports four independent blocking checks: the executable-source line
  limit, ESLint, TypeScript, and deterministic unit tests. Markdown and MDX
  publications are exempt from the source limit. Browser/E2E coverage is not
  part of the PR gate for now.
- `pnpm build` remains the manual/release proof for home SSR, the production lab
  404 and client-asset exclusion, RSS output, and that every prerendered post is
  a real article. A post whose MDX fails to compile renders as a 404 rather than
  crashing the build, so the build must assert posts rendered or it ships dead
  URLs green.

## Open gates

1. **Cut over deliberately.** Deployment rides Vercel's git integration. Before
   retiring the old site, verify the deployed domain, the archived-post
   redirect, feed, metadata, the no-WebGL state, and the reduced-motion state.
2. **Grow the published set.** `neural-nets-for-eye-disease` is content-complete
   and is the only post production ships today. `how-i-built-beneverman-com`
   stays a draft until Ben lands a shader worth writing up. Figures, captions,
   and visual rhythm stay a Ben + Claude decision, not a port to grind through.

## Non-goals

No search, sidebar/doc tree, CMS, comments, versioning, or i18n. A content layer
is only worth adding if post count makes the current build path measurably
painful. Mermaid and video embeds remain possible future components, not v1
requirements.

The old post source remains local at
`~/Documents/Code/web/beneverman.com-v6-fumadocs`. The
`minimalist-ai-agent` post is intentionally retired, not awaiting porting.
