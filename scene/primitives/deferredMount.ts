import { useEffect, useState } from 'react'
import { emitDebugTimelineEvent } from '../debugTimeline'

// Defers a heavy lazy chunk until after the page is interactive: the setTimeout
// yields so first paint, hydration, and input handlers win the main thread
// before the chunk is requested. `delayMs` pushes the mount further out — use
// it to keep expensive init (Three.js setup, shader compiles) from landing in
// the middle of another layer's entrance animation. `label` names the layer in
// the debug timeline (e.g. 'shadow' -> 'shadow gated' / 'shadow chunk
// scheduled').
export function useDeferredMount(shouldLoad: boolean, label: string, delayMs = 0) {
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    if (!shouldLoad) {
      emitDebugTimelineEvent(`${label} gated`)
      return
    }
    emitDebugTimelineEvent(`${label} chunk scheduled`)
    const timeoutId = globalThis.setTimeout(() => setIsReady(true), delayMs)
    return () => globalThis.clearTimeout(timeoutId)
  }, [shouldLoad, label, delayMs])
  return shouldLoad && isReady
}
