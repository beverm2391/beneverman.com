---
name: verify
description: Build/launch/drive recipe for verifying beneverman.com changes at runtime.
---

# Verifying beneverman.com

## Launch

A dev server is often already running on :3000 (`.next/dev/logs/next-development.log`
names the PID). Check before starting your own; Next refuses a second `next dev`
for the same dir. If none: `pnpm dev --port <port>`.

`pnpm check` = lint + typecheck + vitest, but that's CI, not verification.

Gotchas:

- Dev 500s everywhere with `TurbopackInternalError: Failed to restore task
  data`: the dev cache corrupted (usually from `pnpm build` running while dev
  was up — avoid interleaving them). Kill the dev server, move `.next/dev`
  aside, restart.
- The same stale dev cache can fail *silently*: a globals.css edit logs
  "✓ Compiled" but the served CSS chunk keeps the old rules, even across
  dev-server restarts. If a style change won't appear and it isn't browser
  cache (curl the chunk to check), move `.next/dev` aside and restart.
- Chrome caches the prerendered homepage HTML + hashed chunks aggressively;
  after rebuilding, hard-refresh or cache-bust with a query param, or you will
  verify a stale build.
- Multiple `next start` processes can pile up on one port; the first one keeps
  the socket and serves its stale in-memory build. `safe lsof -i :<port> -t`
  and kill them all before restarting.
- Other agents may drive the same browser and navigate your tab mid-
  measurement; record `location.href` inside evals and treat wrong-origin
  results as invalid.

## Drive

Use agent-browser. Other agents may share the default browser/tab — pass a
`namespace` to get an isolated browser instance if you see the tab navigating
out from under you.

Flows worth driving:

- **Homepage SSR/no-JS**: `curl -s localhost:3000/ | grep` for intro copy and
  inline `--intro-*`/`--texture-*` vars on `main.site-shell`. The scene is
  client-only: server HTML has no scene markup by design. For the full no-JS
  state: agent-browser `network_route` with `resourceType: script, abort:
  true`, reload, screenshot — flat shell background + readable copy.
- **Scene arrival**: each WebGL layer carries `.scene-arrival-layer` and gains
  `.is-ready` the moment its own first frame is GPU-fence-verified — gradient
  first (~250ms), shadow later. The load ladder is measurable post-hoc:
  `performance.getEntriesByType('mark')` gives `scene:gradient-live`,
  `scene:shadow-live`, `scene:arrival`.
- **Debug panel**: `/?debug` — type tab sliders must restyle the intro copy
  (inline vars on `main.site-shell` change); shadow tab background buttons
  (paper/amber/…) must change shell + documentElement background. Range inputs
  need the native value setter + `input` event to reach React's onChange.
- **Content never remounts**: page content is server-rendered outside the
  client scene swap (see scene/primitives/clientScene.tsx). A MutationObserver
  for removals of `.intro`/`main.site-shell` should stay silent through debug
  panel changes.
- **Lab**: `/lab` must render layers bounded inside `.lab-render-layer`.
