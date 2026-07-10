import { useCallback, useState } from 'react'

// The reveal invariant for enhanced scene layers: never dismiss the CSS-only
// fallback merely because a component mounted or a chunk loaded. Call reveal()
// only after the layer has actually presented a frame (e.g. inside the first
// WebGL render), so a failed or unavailable context leaves the complete static
// scene in place. Pair with the .scene-fallback-layer / .scene-live-layer
// classes in sceneFade.css so the swap reads as added detail, not a flash.
export function useFirstFrameReveal() {
  const [isRevealed, setIsRevealed] = useState(false)
  const reveal = useCallback(() => setIsRevealed(true), [])
  return { isRevealed, reveal }
}
