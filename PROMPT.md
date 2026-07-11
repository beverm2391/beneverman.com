# beneverman.com — dev knowledge

Canonical personal site: Next.js App Router + TypeScript. It has an art-first
landing, an MDX blog, and a development-only scene lab. Product promise, proof,
and open gates live in `PRODUCT.md`; work state lives in Linear's **Personal
Website** project.

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
Source warns at 400 physical lines and blocks at 450; `PROMPT.md` warns at 250
and blocks at 300. GLSL is source and follows the same limit. `pnpm install`
configures the hook.

## Architecture

- The root page server-renders the shell, copy, and sun indicator; the WebGL
  scene is a client-only dynamic chunk (`scene/HomeMount`) mounted behind them
  as pure decoration. There is no CSS imitation of the scene: each layer fades
  in only after its first frame is GPU-fence-verified, and no-JS/no-WebGL
  visitors keep the flat page. The paradigm and its invariants live in
  `scene/primitives/` (`clientScene`, `sceneArrival`, `gpuFrameFence`,
  `sceneShell`) — read those doc comments before changing homepage loading.
  Page content must never live inside the dynamic scene swap.
- Blog routes live under `app/(content)/blog`; content lives in
  `content/blog/*.mdx`. `lib/blog-data.ts` owns discovery and validation;
  `lib/blog.ts` owns MDX compilation, the shared Shiki instance, and the
  component map. Metadata/feed routes should import the data-only module.
- ```mermaid fences render to inline SVG at compile time (rehype-mermaid via
  headless Chromium; its packages sit in `serverExternalPackages` because
  Turbopack lacks `import.meta.resolve`). Any environment that runs
  `next build` needs `pnpm exec playwright install chromium` first.
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

Styling policy (Ben, 2026-07): Tailwind where appropriate — UI chrome, layout,
and components you iterate on are Tailwind-first — but bespoke CSS files are
fine for genuinely custom/graphical artifacts (e.g. `SunWidget.css`, the
`sceneArrival.css` primitive, tuned scene visuals in `App.css`). Don't port
tuned scene CSS for its own sake; `Lab.css` is the one migration worth doing
(BCP-2840). Selectors that cannot live on a component (library-portaled DOM
like the image-zoom modal) also stay in CSS.

Tailwind v4 gotcha: utilities are generated only by the `globals.css` build.
A `@theme` in any other file (e.g. `components/ui/coss.css`) defines variables
but cannot emit utilities — Coss semantic tokens must stay mapped in globals'
`@theme inline` or their utilities silently vanish (transparent popups).

Geist is the self-hosted site sans. Inter is a loaded fallback/debug choice;
JetBrains Mono is the code font. Refer to the `next/font` variables instead of
literal `Inter` or imaginary `Geist Mono` families. The blog paper layers are
content-layout scoped.

Keep Shiki server/build-time only. The scene lab remains development-only. The
blog's visual design is done interactively by Ben + Claude; Codex should not
turn those decisions into an unsolicited redesign.
