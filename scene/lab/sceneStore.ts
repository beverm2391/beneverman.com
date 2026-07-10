// Build-time access to saved scenes, for promoting a lab scene to the live
// site IN CODE. Scene JSON files are bundled statically, so the homepage can
// render a tuned scene through the shared LayerStack:
//
//   import { getSceneById } from './lab/sceneStore'
//   import { LayerStack } from './lab/LayerStack'
//   const scene = getSceneById('sundial')
//   {scene && <LayerStack scene={scene} />}
//
// This is the read path for production; the lab itself reads/writes live disk
// state through scenesClient.ts during dev.
//
// NOTE (Next port): Vite's import.meta.glob isn't available here, so committed
// scenes are imported explicitly. Adding a new promotable scene = drop the JSON
// in ./scenes and add it to the list below. (A generated index could restore
// auto-discovery later; deferred to the post-port refactor.)

import type { Scene } from './scene'
import sundial from './scenes/sundial.json'

export const bundledScenes: Scene[] = [sundial as unknown as Scene]

export function getSceneById(id: string): Scene | undefined {
  return bundledScenes.find((scene) => scene.id === id)
}
