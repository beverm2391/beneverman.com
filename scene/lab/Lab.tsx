'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from './useSearchParams'
import { defaultAnimState, sunAngleSweep, useSweep, type AnimState } from './animatedParam'
import { createLayerInstance, createScene } from './layers'
import { LayerStack } from './LayerStack'
import {
  cloneScene,
  moveLayer,
  removeLayer,
  slugify,
  updateLayer,
  withLayer,
  type LayerType,
  type Scene,
  type SceneTheme,
} from './scene'
import {
  deleteScene as deleteSceneOnDisk,
  getPromoted,
  listScenes,
  saveScene as saveSceneToDisk,
  setPromoted,
} from './scenesClient'
import { LabSidebar, type LabActions } from './LabSidebar'
import { LabTopBar } from './LabTopBar'
import '@/components/ui/coss.css'
import '../App.css'
import './Lab.css'

export default function Lab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [savedScenes, setSavedScenes] = useState<Scene[]>([])
  const [scene, setScene] = useState<Scene | null>(null)
  const [savedSceneId, setSavedSceneId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('')
  const [promotedId, setPromotedId] = useState<string | null>(null)
  // Sun-angle animation is a preview aid, not part of the saved scene: it sweeps
  // a display angle without touching scene.sunAngle.
  const [sunAnim, setSunAnim] = useState<AnimState>(defaultAnimState)
  // Which theme the stage previews; themed layers read it, nothing saves it.
  const [previewTheme, setPreviewTheme] = useState<SceneTheme>('light')
  // Transient mesh-inspector view state, keyed by layer instance id. Not part
  // of the saved scene, so toggling it never dirties.
  const [inspectedIds, setInspectedIds] = useState<Set<string>>(new Set())
  const toggleInspect = useCallback((instanceId: string) => {
    setInspectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(instanceId)) next.delete(instanceId)
      else next.add(instanceId)
      return next
    })
  }, [])

  const selectInto = useCallback(
    (next: Scene, persistedId: string | null) => {
      setScene(cloneScene(next))
      setSavedSceneId(persistedId)
      setDirty(false)
      setInspectedIds(new Set())
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set('scene', next.id)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Load disk scenes on mount; seed a starter if the store is empty.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let scenes = await listScenes()
        if (scenes.length === 0) {
          const starter = createScene('Sundial')
          await saveSceneToDisk(starter)
          scenes = [starter]
        }
        const promoted = await getPromoted().catch(() => null)
        if (cancelled) return
        setSavedScenes(scenes)
        setPromotedId(promoted)
        const wanted = searchParams.get('scene')
        const initial = scenes.find((s) => s.id === wanted) ?? scenes[0]
        setScene(cloneScene(initial))
        setSavedSceneId(initial.id)
        setDirty(false)
      } catch (error) {
        if (!cancelled) setStatus(`load failed: ${String(error)}`)
      }
    })()
    return () => {
      cancelled = true
    }
    // Run once — the scene deep-link is read on first load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Coss components (selects, menus) portal their popups to <body>, outside the
  // .lab.dark wrapper. Put `dark` on the document root while the lab is mounted
  // so those portaled popups pick up the dark tokens too.
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => document.documentElement.classList.remove('dark')
  }, [])

  // Preview-only sun-angle sweep (matches the homepage cycle); never touches
  // the saved scene.
  const displaySunAngle = useSweep(sunAnim.on, sunAnim.rate, scene?.sunAngle ?? 0, sunAngleSweep)

  const edit = useCallback((next: (scene: Scene) => Scene) => {
    setScene((current) => (current ? next(current) : current))
    setDirty(true)
  }, [])

  const persistScene = useCallback(
    async (next: Scene) => {
      await saveSceneToDisk(next, savedSceneId)
      if (savedSceneId && savedSceneId !== next.id) await deleteSceneOnDisk(savedSceneId)
      setSavedSceneId(next.id)
      setSavedScenes(await listScenes())
    },
    [savedSceneId],
  )

  const actions = useMemo<LabActions>(
    () => ({
      selectScene: (id) => {
        const target = savedScenes.find((s) => s.id === id)
        if (target) selectInto(target, target.id)
      },
      newScene: () => selectInto(createScene('Untitled', []), null),
      duplicateScene: () => {
        if (!scene) return
        const copyName = `${scene.name} copy`
        selectInto({ ...cloneScene(scene), id: slugify(copyName), name: copyName }, null)
        setDirty(true)
      },
      renameScene: (name) => edit((current) => ({ ...current, name, id: slugify(name) })),
      deleteScene: async () => {
        if (!scene) return
        try {
          if (savedSceneId) await deleteSceneOnDisk(savedSceneId)
          if (promotedId === savedSceneId) {
            await setPromoted(null)
            setPromotedId(null)
          }
          const remaining = savedScenes.filter((s) => s.id !== savedSceneId)
          setSavedScenes(remaining)
          const next = remaining[0] ?? createScene('Sundial')
          selectInto(next, remaining[0]?.id ?? null)
          setStatus('deleted')
        } catch (error) {
          setStatus(`delete failed: ${String(error)}`)
        }
      },
      saveScene: async () => {
        if (!scene) return
        try {
          await persistScene(scene)
          setDirty(false)
          setStatus('saved')
        } catch (error) {
          setStatus(`save failed: ${String(error)}`)
        }
      },
      copyJson: async () => {
        if (!scene) return
        try {
          await navigator.clipboard.writeText(JSON.stringify(scene, null, 2))
          setStatus('copied JSON')
        } catch (error) {
          setStatus(`copy failed: ${String(error)}`)
        }
      },
      promote: async () => {
        if (!scene) return
        try {
          await persistScene(scene)
          setDirty(false)
          await setPromoted(scene)
          setPromotedId(scene.id)
          setStatus('promoted — commit scene/lab/promoted.json to deploy')
        } catch (error) {
          setStatus(`promote failed: ${String(error)}`)
        }
      },
      setSunAngle: (value) => edit((current) => ({ ...current, sunAngle: value })),
      addLayer: (type: LayerType) => edit((current) => withLayer(current, createLayerInstance(type))),
      removeLayer: (instanceId) => edit((current) => removeLayer(current, instanceId)),
      toggleLayer: (instanceId) =>
        edit((current) => updateLayer(current, instanceId, (layer) => ({ ...layer, enabled: !layer.enabled }))),
      setLayerConfig: (instanceId, key, value) =>
        edit((current) =>
          updateLayer(current, instanceId, (layer) => ({ ...layer, config: { ...layer.config, [key]: value } })),
        ),
      reorderLayer: (from, to) => edit((current) => moveLayer(current, from, to)),
    }),
    [savedScenes, scene, savedSceneId, promotedId, selectInto, edit, persistScene],
  )

  if (!scene) {
    return <div className="lab dark lab--loading">{status || 'loading lab…'}</div>
  }

  let displayScene = sunAnim.on ? { ...scene, sunAngle: displaySunAngle } : scene
  // Mesh inspector is a debug view: isolate it, rendering only the inspected
  // layer(s) with inspect forced on, so no other overlays are in the way.
  if (inspectedIds.size > 0) {
    displayScene = {
      ...displayScene,
      layers: displayScene.layers
        .filter((layer) => inspectedIds.has(layer.instanceId))
        .map((layer) => ({ ...layer, config: { ...layer.config, inspect: true } })),
    }
  }

  return (
    <div className="lab dark">
      <LabSidebar
        actions={actions}
        inspectedIds={inspectedIds}
        onPreviewTheme={setPreviewTheme}
        onSunAnim={setSunAnim}
        onToggleInspect={toggleInspect}
        previewTheme={previewTheme}
        scene={scene}
        sunAnim={sunAnim}
      />
      <div className="lab__stage">
        <LabTopBar
          actions={actions}
          dirty={dirty}
          promotedId={promotedId}
          savedScenes={savedScenes}
          scene={scene}
          status={status}
        />
        <div className="lab__viewer">
          <LayerStack scene={displayScene} theme={previewTheme} />
        </div>
      </div>
    </div>
  )
}
