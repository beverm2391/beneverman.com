import { useCallback, useEffect, useMemo, useState } from 'react'
import { emitDebugTimelineEvent } from '../debugTimeline'
import './sceneArrival.css'

// The scene arrival paradigm: server-rendered content paints on the shell's
// flat background, and WebGL layers fade in from it only once real frames
// exist. There is no CSS stand-in imitating the shaders — matching a live
// render with static CSS is what caused seam flashes. No-JS/no-WebGL
// visitors simply keep the clean flat page.
//
// Gate only layers that need to prove a frame (canvases). Plain DOM/CSS
// pieces (copy, indicators, widgets) are content: server-render them for
// first paint and hand off to the client version at identical geometry.
//
// Contract for any scene:
// - Name the layers you intend to show and pass them as `wantedLayers`
//   (recompute the array when capability gates change what you want).
// - Each layer calls `markLive(name)` only after the GPU has actually
//   executed its first frame — verified with a fence sync where available
//   (see gpuFrameFence.ts) — never on mount, chunk load, or merely-queued
//   draw calls, so a failed context or a stalled shader compile leaves the
//   flat page instead of fading in an empty layer.
//
// Two choreographies, both derived from the same live-layer registry:
// - Per-layer (preferred): put `layerClassName(name)` on each layer's
//   element; every layer fades in the moment IT is ready, so a fast gradient
//   isn't held hostage by a heavy shadow chunk.
// - Together: wrap the stack in `className`; it fades once when every wanted
//   layer is live, with `graceMs` as a straggler cap so the scene still
//   appears if one layer stalls.
export function useSceneArrival(wantedLayers: readonly string[], graceMs = 3500) {
  const [liveLayers, setLiveLayers] = useState<ReadonlySet<string>>(new Set())
  const [graceElapsed, setGraceElapsed] = useState(false)
  const wantedKey = wantedLayers.join(',')

  const markLive = useCallback((layer: string) => {
    setLiveLayers((current) => {
      if (current.has(layer)) return current
      emitDebugTimelineEvent(`${layer} live`)
      // performance.mark makes the arrival ladder measurable in any browser:
      // performance.getEntriesByType('mark') or the DevTools Performance panel.
      performance.mark(`scene:${layer}-live`)
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
    if (!isReady) return
    emitDebugTimelineEvent('scene arrival')
    performance.mark('scene:arrival')
  }, [isReady])

  const layerClassName = useCallback(
    (layer: string) => `scene-arrival-layer${liveLayers.has(layer) ? ' is-ready' : ''}`,
    [liveLayers],
  )

  return {
    isReady,
    markLive,
    layerClassName,
    className: `scene-arrival${isReady ? ' is-ready' : ''}`,
  }
}
