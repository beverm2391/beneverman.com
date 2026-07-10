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
- **Scene arrival**: after JS load, the `.scene-arrival` wrapper gains
  `.is-ready` once every wanted layer has drawn a frame, and the whole scene
  (gradient, shadow, sun widget) fades in as one unit. Debug timeline logs
  `gradient live` / `shadow live` / `scene arrival`.
- **Debug panel**: `/?debug` — type tab sliders must restyle the intro copy
  (inline vars on `main.site-shell` change); shadow tab background buttons
  (paper/amber/…) must change shell + documentElement background. Range inputs
  need the native value setter + `input` event to reach React's onChange.
- **Content never remounts**: page content is server-rendered outside the
  client scene swap (see scene/primitives/clientScene.tsx). A MutationObserver
  for removals of `.intro`/`main.site-shell` should stay silent through debug
  panel changes.
- **Lab**: `/lab` must render layers bounded inside `.lab-render-layer`.
