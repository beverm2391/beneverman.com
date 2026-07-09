# beneverman.com — dev knowledge

Canonical personal site: Next.js + TypeScript, art-first landing + bespoke MDX
blog + a dev-only scene lab. Product promise, acceptance, and open gates live in
`PRODUCT.md`. Work is tracked in the Linear project **Personal Website** (BCP).

The renderer and lab are ported from the archived `beneverman.com-v7` (Vite +
three.js); that repo remains the historical source.

## Status

Initial Next.js scaffold is in place. The blog plumbing is intentionally
unstyled: App Router routes, `.mdx` files in `content/blog/`, frontmatter
validation, GFM, and build-time Shiki highlighting through `rehype-pretty-code`.

## Commands

Package manager: `pnpm`.

- Dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`

## Layout

- `app/` — App Router routes and the bare global reset.
- `app/blog/page.tsx` — blog index generated from post frontmatter.
- `app/blog/[slug]/page.tsx` — statically generated post pages.
- `content/blog/*.mdx` — blog source data.
- `lib/blog.ts` — post discovery, zod frontmatter validation, and MDX compile
  pipeline.
- `public/images/blog/` — image assets referenced by seeded posts.

## Conventions

- Use pnpm; do not add npm or yarn lockfiles.
- The blog's visual design is done interactively (Ben + Claude), not by Codex —
  Codex ships plumbing unstyled.
- Keep highlighting server/build-time only. `lib/blog.ts` owns the shared Shiki
  highlighter instance and the scoped languages (`python`, `typescript`,
  `javascript`, `bash`, `json`).
- The scene lab is dev-only and must never enter the production bundle.
