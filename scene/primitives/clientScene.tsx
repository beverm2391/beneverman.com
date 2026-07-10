'use client'

import dynamic from 'next/dynamic'
import type { ComponentType, ReactNode } from 'react'

// The site's scene loading paradigm, step one: a scene is a client-only
// enhancement mounted behind server-rendered content.
//
// - The static shell is the dynamic import's loading component, so Next emits
//   it in the initial HTML. It must be the complete CSS-only experience — not
//   a spinner — because it doubles as the durable no-JavaScript/no-WebGL state.
// - `ssr: false` keeps renderer code (window, WebGL, Three) out of the server
//   bundle entirely.
// - Page content must NOT live inside the scene: when the chunk loads, React
//   replaces the shell subtree with the scene subtree (different component
//   types remount the DOM), which would re-run CSS animations and reset
//   selection/focus in anything caught inside the swap. Render content as a
//   sibling in the server page and let the scene style the shared shell via
//   useSceneShellStyle.
export function createClientScene(
  load: () => Promise<{ default: ComponentType }>,
  StaticShell: () => ReactNode,
) {
  return dynamic(load, { ssr: false, loading: StaticShell })
}
