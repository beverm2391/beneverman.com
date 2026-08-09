# beneverman.com — dev knowledge

Canonical personal site: Next.js App Router + TypeScript. It has a flat
landing, an MDX blog, a research publication surface, and a development-only
scene lab. Product promise, proof, and open gates live in `PRODUCT.md`; work
state lives in Linear's **Personal Website** project.

The renderer and lab originated in the archived `beneverman.com-v7`, which is
historical source rather than a second owner.

## Commands and gates

Package manager: `pnpm`. Do not add npm or Yarn lockfiles.

- `pnpm dev` — local development
- `pnpm lint` — blocking ESLint errors
- `pnpm typecheck` — TypeScript without emit
- `pnpm test` — deterministic Vitest suite
- `pnpm check` — lint, typecheck, and tests
- `pnpm build` — Next production build plus artifact assertions for home SSR,
  lab exclusion, and RSS

CI exposes four independent required checks: LOC, ESLint, TypeScript, and unit
tests. Browser/E2E and production builds are intentionally outside the PR gate
for now. The tracked pre-commit hook runs the staged line check and ESLint.
Executable source warns at 400 physical lines and blocks at 450; Markdown and
MDX content are exempt. `PROMPT.md` is injected context, so it warns at 250 and
blocks at 300. GLSL follows the normal executable-source limit. `pnpm install`
configures the hook.

## Architecture

- The root page is a flat, fully server-rendered page (Ben, 2026-07): same
  background, tokens, and theme toggle as the blog. The WebGL sun scene
  no longer mounts in production — it is parked in the dev-only lab for a
  future pass. Its mounting paradigm and invariants live in
  `scene/primitives/` (`clientScene`, `sceneArrival`, `gpuFrameFence`,
  `sceneShell`); read those doc comments before remounting any scene on a
  route. `scene/homeCopy.ts` still owns the intro copy (the lab's text layer
  renders it too).
- Blog and Direction share the `app/(content)` chrome and styling. Blog content
  lives in `content/blog/*.mdx`; `lib/blog-data.ts` owns its discovery,
  frontmatter, and status policy. The evergreen Direction page reads
  `content/pages/direction.mdx` through `lib/content-page-data.ts`. Research
  publications live in `content/research/*.mdx` and render through the separate
  `app/(research)` group: it imports the shared long-form primitives without
  inheriting the generic site header or theme control. Blog and Research share
  the publication schema/status policy in `lib/publication-data.ts` and the MDX
  compilation pipeline in `lib/mdx.ts`; metadata/feed routes should import
  data-only modules.
- `$...$` and `$$...$$` LaTeX render to KaTeX + MathML at compile time through
  the shared MDX pipeline. KaTeX's stylesheet stays scoped to the two writing
  route groups so the homepage does not download it.
- ```mermaid fences render to inline SVG at compile time. `pnpm build` installs
  its own Chromium: playwright's locally, `@sparticuz/chromium` on Vercel, the
  only one that launches there. Mermaid's packages sit in
  `serverExternalPackages` because Turbopack lacks `import.meta.resolve`.
  `lib/mermaid-theme.ts` owns the config; `docs/mermaid-renderer.md` explains
  why any of it is true. Read that before changing the pipeline: the theme, the
  font loading and the two browsers each look removable and are not.
- Drafts render locally and on Vercel previews (`VERCEL_ENV=preview`), never in
  production. Previews are auth-gated and noindex, so they are where unfinished
  posts get reviewed, and a broken draft fails its own preview.
- The lab lives at `/lab`. `next.config.ts` aliases the exact `LabMount` import
  to `LabUnavailable` during production builds. Preserve that boundary and the
  build assertion that checks lab JS/CSS cannot leak into static assets.
- Development lab persistence uses `/lab-io/*` route handlers and
  `scene/lab/scenes/*.json`. Promoting writes the full validated production
  snapshot to `scene/lab/promoted.json`; there is no manual scene registry.
- Shaders are `.glsl` files under `scene/shaders` and load as raw text through
  the Turbopack rule in `next.config.ts`.

## Styling and fonts

Tailwind v4 enters once through `app/globals.css`. Coss theme CSS references
that entry instead of importing Tailwind a second time. Lab CSS and scene CSS
are imported at their route/client boundaries, not the root layout, so blog
routes do not pay for them.

Light/dark state uses `@wrksz/themes`: the root layout must import its `/next`
provider so the bootstrap script is inserted outside the React client tree.
Do not swap back to `next-themes`; its client-rendered script errors on React 19.

Styling policy (Ben, 2026-07): Tailwind wherever reasonably possible — UI
chrome, layout, and components are Tailwind-first, and new code defaults to
it. Bespoke CSS files stay only where they are genuinely cleaner: custom
graphical artifacts (`SunWidget.css`), documented primitives
(`sceneArrival.css`), tuned scene visuals (`App.css` — don't port for its own
sake, its scene will be replaced), and selectors that cannot live on a
component (library-portaled DOM like the image-zoom modal). `Lab.css` is the
one migration worth doing (BCP-2840).

For UI work, inspect the live route before making changes. After the change,
visually verify the updated route in the in-app browser. Reading source code or
running tests does not replace this visual check.

Tailwind v4 gotcha: utilities are generated only by the `globals.css` build.
A `@theme` in any other file (e.g. `components/ui/coss.css`) defines variables
but cannot emit utilities — Coss semantic tokens must stay mapped in globals'
`@theme inline` or their utilities silently vanish (transparent popups).

Geist is the self-hosted site sans. Inter is a loaded fallback/debug choice;
JetBrains Mono is the default code font. Research is the deliberate exception:
its nested layout loads Lora for the paper and Geist Mono for BENCORP-compatible
metadata and breadcrumb chrome. Refer to their `next/font` variables instead of
literal family names. The background is the flat `--bg` token on the normal
site routes — the wash gradient and grain overlay were tried and deleted
(2026-07); Research owns its neutral paper palette.

Keep Shiki server/build-time only. The scene lab remains development-only. The
blog's visual design is done interactively by Ben + Claude; Codex should not
turn those decisions into an unsolicited redesign.
