'use client'

import dynamic from 'next/dynamic'
import type { ComponentType, ReactNode } from 'react'

// The site's scene loading paradigm: a scene is a client-only, purely additive
// decoration mounted behind server-rendered content.
//
// - `ssr: false` keeps renderer code (window, WebGL, Three) out of the server
//   bundle entirely.
// - Page content must NOT live inside the scene: when the chunk loads, React
//   replaces the loading subtree with the scene subtree (different component
//   types remount the DOM), which would re-run CSS animations and reset
//   selection/focus in anything caught inside the swap. Render content as a
//   sibling in the server page and let the scene style the shared shell via
//   useSceneShellStyle.
// - The scene's visual layers fade in as one unit only after they have
//   rendered real frames (useSceneArrival). Before that — and permanently for
//   no-JS/no-WebGL visitors — the page is the shell's flat background plus
//   content, so there is nothing to flash. An optional StaticShell renders
//   during loading for scenes that do want SSR chrome of their own.
export function createClientScene(
  load: () => Promise<{ default: ComponentType }>,
  StaticShell?: () => ReactNode,
) {
  return dynamic(load, { ssr: false, ...(StaticShell ? { loading: StaticShell } : {}) })
}
