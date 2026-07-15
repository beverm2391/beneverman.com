import type { ShadowMapMode } from './shadowMapModes'

export type ShadowSourcePreview = {
  dataUrl?: string
  height: number
  mode: ShadowMapMode
  sampler?: {
    contributingSamples: number
    points: ShadowSourceSamplerPoint[]
    sampleX: number
    sampleY: number
    shadowFactor: number
  }
  width: number
}

export type ShadowSourceSamplerPoint = {
  casterSize: number
  contributes: boolean
  hitCaster: boolean
  x: number
  y: number
}

const listeners = new Set<(preview: ShadowSourcePreview | null) => void>()
let currentPreview: ShadowSourcePreview | null = null

export function publishShadowSourcePreview(preview: ShadowSourcePreview) {
  currentPreview = preview
  listeners.forEach((listener) => listener(currentPreview))
}

// Producing a preview requires a synchronous GPU readback (a full pipeline
// stall), so the producer checks this and skips the work when nothing is
// showing previews — e.g. the lab, where settings change on every slider tick.
export function hasShadowSourcePreviewListeners() {
  return listeners.size > 0
}

export function getShadowSourcePreview() {
  return currentPreview
}

export function subscribeShadowSourcePreview(listener: (preview: ShadowSourcePreview | null) => void) {
  listeners.add(listener)
  listener(currentPreview)

  return () => {
    listeners.delete(listener)
  }
}
