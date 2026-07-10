import { useCallback, useEffect, useMemo, useState } from 'react'
import { emitDebugTimelineEvent } from '../debugTimeline'
import './sceneArrival.css'

// The scene arrival paradigm: server-rendered content paints on the shell's
// flat background, every scene layer mounts inside a `.scene-arrival`
// container at opacity 0, and the whole stack fades in ONCE when every wanted
// layer has presented a real frame. There is no CSS stand-in imitating the
// shaders — matching a live render with static CSS is what caused seam
// flashes. No-JS/no-WebGL visitors simply keep the clean flat page.
//
// Contract for any scene:
// - Name the layers you intend to show and pass them as `wantedLayers`
//   (recompute the array when capability gates change what you want).
// - Each layer calls `markLive(name)` only after it has actually produced a
//   frame (first WebGL draw, first R3F frame callback) — never on mount or
//   chunk load, so a failed context leaves the flat page instead of a hole.
// - Spread `className` onto the container(s) wrapping the layers.
//
// If some layers go live but the rest stall past `graceMs`, the scene fades
// in with what it has rather than never appearing (a later layer then appears
// without its own fade — rare enough not to choreograph).
export function useSceneArrival(wantedLayers: readonly string[], graceMs = 3500) {
  const [liveLayers, setLiveLayers] = useState<ReadonlySet<string>>(new Set())
  const [graceElapsed, setGraceElapsed] = useState(false)
  const wantedKey = wantedLayers.join(',')

  const markLive = useCallback((layer: string) => {
    setLiveLayers((current) => {
      if (current.has(layer)) return current
      emitDebugTimelineEvent(`${layer} live`)
      return new Set(current).add(layer)
    })
  }, [])

  const allLive = useMemo(
    () => wantedKey.split(',').every((layer) => layer === '' || liveLayers.has(layer)),
    [wantedKey, liveLayers],
  )

  useEffect(() => {
    if (allLive || liveLayers.size === 0) return
    const timeoutId = globalThis.setTimeout(() => setGraceElapsed(true), graceMs)
    return () => globalThis.clearTimeout(timeoutId)
  }, [allLive, liveLayers, graceMs])

  const isReady = allLive || (liveLayers.size > 0 && graceElapsed)

  useEffect(() => {
    if (isReady) emitDebugTimelineEvent('scene arrival')
  }, [isReady])

  return {
    isReady,
    markLive,
    className: `scene-arrival${isReady ? ' is-ready' : ''}`,
  }
}
