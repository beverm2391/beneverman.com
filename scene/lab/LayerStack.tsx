// Renders the lab's enabled layers as an absolutely-positioned stack.
// Promotion maps the saved values into the homepage's responsive renderer;
// the homepage keeps its own battery and reduced-motion behavior.

import { getLayerDef } from './layers'
import type { Scene } from './scene'

export function LayerStack({ scene }: { scene: Scene }) {
  const count = scene.layers.length
  return (
    <>
      {scene.layers.map((layer, index) => {
        if (!layer.enabled) return null
        const def = getLayerDef(layer.type)
        if (!def) return null
        // Top of the list paints in front.
        const zIndex = count - index
        return (
          <div className="lab-render-layer" key={layer.instanceId} style={{ zIndex }}>
            {def.Render({ config: layer.config, sunAngle: scene.sunAngle })}
          </div>
        )
      })}
    </>
  )
}
