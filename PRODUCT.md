# beneverman.com — product

Ben's personal home: an **art-first landing page** plus a **small, high-craft
technical blog**, under his own name. One cohesive site, minimal and bespoke.

This is the canonical `beneverman.com` repo (Next.js). It houses the landing,
the blog, and the scene lab. The predecessor `beneverman.com-v7` (Vite +
three.js) is the archived source we port the renderer and lab *from*.

Work is tracked in the Linear project **Personal Website** (BCP). Dev workflow,
commands, and layout live in `PROMPT.md` — this file owns the product promise,
acceptance, and open gates.

## Mental model

Three surfaces, one aesthetic:

- **Landing (`/`)** — the animated WebGL shadow/sun scene + intro copy. The
  identity piece. Visuals are authored in the lab and promoted as a scene JSON.
- **Blog** — technical build-in-public posts (MDX). Currently 2 posts, growing
  slowly. Under Ben's name (not bencorp.dev); it's technical, so the personal
  domain is the right home and preserves SEO.
- **Scene lab** (dev-only) — the compositor that authors the landing visuals.
  Ships in this repo, dev-only, never in the production bundle.

## Acceptance

**Landing**
- Fast first paint, no layout shift.
- Graceful degradation: reduced-motion, low-battery, and no-WebGL resolve to a
  sensible static state, never blank/broken.
- Visuals come from a promoted lab scene, not hand-edited magic numbers.

**Blog**
- MDX posts rendered by a **bespoke slim renderer** on the standard
  remark/rehype pipeline — no docs framework. Bespoke = our styling, component
  map, and layout; not a hand-rolled Markdown parser.
- **Content as data**: posts are `.mdx` in `content/blog/`, read and compiled
  with `next-mdx-remote` — no content-layer codegen, no `@next/mdx`
  route-modules. Authoring is unchanged: drop an `.mdx` with frontmatter.
- **Static generation** via `generateStaticParams`.
- **Build-time Shiki** highlighting (`rehype-pretty-code`), one **shared
  highlighter instance** with only the languages we use — zero runtime highlight
  JS. This is the lever that keeps MDX builds fast as posts grow.
- `remark-gfm` for tables + footnotes (posts carry 10–18 citations each).
- Per-post: TOC for long-form, copy-code, optimized images, dark-mode aware.
- Frontmatter validated by a small **zod schema**.
- Blog index from frontmatter; clean `/{slug}` URLs.
- **The blog's visual design is done interactively (Ben + Claude), not by
  Codex.** Codex builds the plumbing unstyled; the look is a collaborative
  track.

**Cross-cutting**
- Minimal client JS; the art scene is the only heavy asset and stays isolated /
  lazy. Strong Lighthouse.
- SEO/portability: per-post metadata + OG images, an **RSS feed**, and **301
  redirects from the old Fumadocs `/blog/*` slugs** so no links or rank break.
- Authoring: a new post is one `.mdx` + frontmatter. Landing tuning is the lab.

## Non-goals (explicit)

No search, no sidebar/doc-tree, no CMS, no comments (v1), no versioning/i18n. A
content-layer (Velite / Content Collections) is a later drop-in **only if** post
count makes build/dev time annoying — reversible, not needed at current scale.

## Build approach

Fresh Next.js app (app router, TS, minimal). Codex owns the mechanical work;
the blog's look is done live with Ben.

- **Scaffold + MDX plumbing (unstyled)** — the skeleton: routing, compile
  pipeline, SSG, seeded posts. Explicitly not designed.
- **Port the landing renderer** from `beneverman.com-v7` as a client component
  (`dynamic(..., { ssr: false })`).
- **Port the scene lab** from v7; its Vite dev-middleware disk persistence
  becomes a **dev-only Next route handler**.
- **SEO + RSS + redirects.**
- **Blog design** — Ben + Claude, interactive, on top of the plumbing.

## Open gates

1. **Content sources.** Locate the current Fumadocs beneverman.com repo to port
   the 2 posts' source `.mdx` + images (port originals, don't re-derive from
   live HTML).
2. **Cutover.** 301s from old `/blog/*` + RSS + OG in place, then point the
   domain — keep the old blog live until the new home exists so writing never
   404s.
