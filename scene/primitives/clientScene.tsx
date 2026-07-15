'use client'

import { lazy, Suspense, useEffect, useState, type ComponentType, type ReactNode } from 'react'

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
// - The scene must never make the page wait, and the mount gate below is what
//   enforces it. This used to be next/dynamic with ssr:false, whose lazy
//   promise never settled when the scene mounted a second time: navigating
//   blog -> home -> blog -> home left the route suspended forever, so the URL
//   changed to / while the blog stayed on screen (navigation is a React
//   transition, which keeps the previous page visible until the new one can
//   commit). Rendering nothing until after mount gives the same ssr:false
//   guarantee, and the route commits before the scene is ever asked for, so
//   decoration cannot hold the page hostage again.
export function createClientScene(
  load: () => Promise<{ default: ComponentType }>,
  StaticShell?: () => ReactNode,
) {
  const Scene = lazy(load)

  return function ClientScene() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const shell = StaticShell ? <StaticShell /> : null
    if (!mounted) return shell

    return <Suspense fallback={shell}>{<Scene />}</Suspense>
  }
}
