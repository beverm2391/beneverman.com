import { useEffect, useState } from 'react'
import { emitDebugTimelineEvent } from '../debugTimeline'

// Defers a heavy lazy chunk until after the page is interactive: the setTimeout
// yields one task so first paint, hydration, and input handlers win the main
// thread before the chunk is requested. `label` names the layer in the debug
// timeline (e.g. 'shadow' -> 'shadow gated' / 'shadow chunk scheduled').
export function useDeferredMount(shouldLoad: boolean, label: string) {
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    if (!shouldLoad) {
      emitDebugTimelineEvent(`${label} gated`)
      return
    }
    emitDebugTimelineEvent(`${label} chunk scheduled`)
    const timeoutId = globalThis.setTimeout(() => setIsReady(true), 0)
    return () => globalThis.clearTimeout(timeoutId)
  }, [shouldLoad, label])
  return shouldLoad && isReady
}
