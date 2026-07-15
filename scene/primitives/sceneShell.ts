import { useEffect } from 'react'
import type { CSSProperties } from 'react'

// The scene shell is the server-rendered <main class="site-shell"> that holds
// page content. The client scene mounts *behind* the content instead of owning
// it (see createClientScene), so when the scene needs to restyle the shell —
// responsive presets, debug typography, background color — it mutates the
// element directly rather than re-rendering it. React never reconciles server
// component HTML after load, so these writes are durable.
const SCENE_SHELL_SELECTOR = 'main.site-shell'

export type SceneShellStyle = CSSProperties & Record<`--${string}`, string | number>

// Applies `style` on top of the shell's server-rendered inline style, restoring
// the baseline before each re-apply (and on unmount) so stale keys never
// accumulate. Memoize the style object — an unstable identity re-runs this on
// every render, including animation-frame renders.
export function useSceneShellStyle(style: SceneShellStyle) {
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(SCENE_SHELL_SELECTOR)
    if (!shell) return
    const baseline = shell.style.cssText
    for (const [key, value] of Object.entries(style)) {
      if (value == null) continue
      if (key.startsWith('--')) {
        shell.style.setProperty(key, String(value))
      } else {
        // CSSProperties keys are camelCase, which CSSStyleDeclaration accepts.
        ;(shell.style as unknown as Record<string, string>)[key] = String(value)
      }
    }
    return () => {
      shell.style.cssText = baseline
    }
  }, [style])
}
