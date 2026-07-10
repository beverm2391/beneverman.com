# beneverman.com — dev knowledge

Canonical personal site: Next.js (App Router) + TypeScript. Three surfaces:
an art-first **landing** (WebGL sun/shadow scene), a bespoke **MDX blog**, and a
dev-only **scene lab** that authors the landing visuals. Product promise,
acceptance, and open gates live in `PRODUCT.md`. Work is tracked in the Linear
project **Personal Website** (BCP).

The landing renderer + lab were ported from the archived `beneverman.com-v7`
(Vite + three.js); that repo remains the historical source.

## Status

Home, blog, and lab are all live and on one styling system. The blog runs on
**Tailwind v4** with **Geist** as the display font; the landing + lab are ported
and working. Remaining cleanup is tracked in Linear (e.g. lifting the home
composition out of the 1,200-line `scene/App.tsx`).

## Commands

Package manager: `pnpm` (do not add npm/yarn lockfiles).

- Dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck` — a `.next/types/validator` race against a running
  dev server can print two spurious errors about blog `page.js` modules; `next
  build` is the authority.

## Layout

- `app/page.tsx` — the landing (`/`), mounts the scene client-only via
  `scene/HomeMount` (`dynamic(ssr:false)`; the scene reads `window` + WebGL).
- `app/(content)/` — the blog route group: `layout.tsx` (header/nav, theme
  toggle, `PaperBackground`, `PaperDebug`), `blog/page.tsx` (index),
  `blog/[slug]/page.tsx` (SSG posts).
- `app/lab/page.tsx` — the scene lab (`/lab`), dev-only (`notFound()` in prod),
  mounts `scene/lab/LabMount` client-only.
- `app/lab-io/` — dev-only Next route handlers for lab scene persistence
  (`/lab-io/scenes` GET/PUT + `[id]` DELETE, `/lab-io/promoted` GET/PUT),
  reading/writing `scene/lab/scenes/*.json` + `promoted.json`. (Endpoints avoid
  a leading `_`, since Next treats `_folders` as private/unrouted.)
- `scene/` — the ported landing + lab + shared sun/shadow renderer (App.tsx,
  V2ShadowLayer, HomeSunGradientLayer, SunWidget, shaders, configs, and
  `scene/lab/`). Framework-agnostic React copied near-verbatim from v7.
- `content/blog/*.mdx` — blog source data. `public/images/blog/` — post images.
- `lib/blog.ts` — post discovery, zod frontmatter validation, the MDX compile
  pipeline, and the `mdxComponents` map (posts may only use registered
  components: `Summary`, `Callout`).
- `components/mdx/` — bespoke MDX components. `components/ui/` — Coss primitives
  (base-ui) used by the lab. `components/debug/paper-debug.tsx` — the draggable
  `?debug` grain tuner. `components/paper-background.tsx` — blog paper layers.

## Conventions

- **Styling is Tailwind v4** (`app/globals.css` is the Tailwind entry: `@import
  "tailwindcss"`, typography `@plugin`, `@theme` mapping our CSS-var tokens,
  class-based dark via next-themes). Blog shells are utilities; post prose uses
  `@tailwindcss/typography` tuned in `.prose` to the bespoke look.
- **Coss UI** (`coss.com/ui`, a shadcn-style registry) → **base-ui** primitives
  are the lab's components; theme in `components/ui/coss.css`, registry wired in
  `components.json` (`@coss`) so more can be pulled via CLI. Gotcha: `coss.css`
  and `globals.css` both `@import "tailwindcss"`; preflight is global.
- **Geist** is the sans font (self-hosted woff2 + `@font-face` in globals);
  JetBrains Mono (next/font) is mono. next/font vars are `--font-inter` /
  `--font-jetbrains` to avoid colliding with Tailwind's `--font-*` tokens.
- The blog's paper background (`.paper-wash` + `.paper-grain`) is blog-scoped via
  `PaperBackground` so it never bleeds onto the home scene. Grain is
  `?debug`-tunable; the wash is fixed.
- Keep Shiki highlighting server/build-time only. `lib/blog.ts` owns the shared
  highlighter instance and scoped languages (`python`, `typescript`,
  `javascript`, `bash`, `json`).
- The scene lab is dev-only and must never enter the production bundle.
- The blog's visual design is done interactively (Ben + Claude), not ticketed to
  Codex.
