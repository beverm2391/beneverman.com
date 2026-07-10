'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { emitDebugTimelineEvent } from './debugTimeline'
import { HomeDebugPanel } from './HomeDebugPanel'
import { HomeSunStatus } from './HomeSunStatus'
import {
  getResponsiveVisualConfig,
  DeferredShadowLayer,
  useAnimatedSunAngle,
  useDebugMode,
  useDebugTimeline,
  useDeferredFontStylesheet,
  useShadowSourcePreview,
} from './homeSceneState'
import { useSceneArrival } from './primitives/sceneArrival'
import { useSceneCapability } from './primitives/sceneCapability'
import { useSceneShellStyle } from './primitives/sceneShell'
import type {
  AppliedVisualPreset,
  DebugPanelTab,
  FontMode,
  ShadowSettings,
  SunWidgetChoice,
  TextureSettings,
  TypeSettings,
  Vec3,
} from './homeSceneTypes'
import { backgroundModes, type BackgroundMode } from './HomeSunGradientConfig'
import { HomeSunGradientLayer } from './HomeSunGradientLayer'
import { getHomeShellStyle } from './homeVisualConfig'
import { activeSiteConfig } from './siteScene'
import { shadowMapModes, type ShadowMapMode } from './shadowMapModes'
import { getShadowFactor } from './SunWidget'

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

function mixVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function App() {
  if (
    process.env.NODE_ENV === 'production' &&
    (window.location.pathname !== '/' || window.location.search || window.location.hash)
  ) {
    window.history.replaceState(null, '', '/')
  }

  const isDebug = useDebugMode()
  useDeferredFontStylesheet(isDebug)

  const [responsiveVisualConfig, setResponsiveVisualConfig] = useState(() =>
    getResponsiveVisualConfig(window.innerWidth, window.innerHeight),
  )
  const activeResponsivePresetRef = useRef<AppliedVisualPreset>(responsiveVisualConfig.appliedPreset)
  const [background, setBackground] = useState<BackgroundMode>(responsiveVisualConfig.background)
  const [font, setFont] = useState<FontMode>(responsiveVisualConfig.font)
  const timelineEvents = useDebugTimeline()
  const shadowCapability = useSceneCapability()
  const [shadowSettings, setShadowSettings] = useState<ShadowSettings>({ ...responsiveVisualConfig.shadowSettings })
  const [shadowMapMode, setShadowMapMode] = useState<ShadowMapMode>(responsiveVisualConfig.shadowMapMode)
  const shouldRenderShadowLayer = shadowMapMode !== 'sun'
  // No mount deferral: App itself only mounts after hydration (client-only
  // dynamic chunk), so layers load as early as possible and the only delay a
  // visitor experiences is each layer's own fade-in.
  const wantsShadowLayer = shadowCapability.enabled && shouldRenderShadowLayer
  // Each WebGL layer fades in the moment its own first frame is GPU-verified
  // (per-layer choreography). DOM/CSS content is never gated on this.
  const arrival = useSceneArrival(wantsShadowLayer ? ['gradient', 'shadow'] : ['gradient'])
  const [isDebugPanelCollapsed, setIsDebugPanelCollapsed] = useState(false)
  const shadowSourcePreview = useShadowSourcePreview()
  const [showShadowSource, setShowShadowSource] = useState(false)
  const [sunWidget, setSunWidget] = useState<SunWidgetChoice>(
    activeSiteConfig.showSunWidget ? activeSiteConfig.sunWidget : 'none',
  )
  const [debugPanelTab, setDebugPanelTab] = useState<DebugPanelTab>('shadow')
  const [typeSettings, setTypeSettings] = useState<TypeSettings>({ ...responsiveVisualConfig.typeSettings })
  const [textureSettings, setTextureSettings] = useState<TextureSettings>({ ...responsiveVisualConfig.textureSettings })

  const backgroundMode = backgroundModes.find((mode) => mode.label === background) ?? backgroundModes[0]
  const effectiveSunAngle = useAnimatedSunAngle(shadowSettings.sunAngle)
  const shadowFactor = getShadowFactor(effectiveSunAngle)
  const sunElevation = Math.sin(effectiveSunAngle)
  const daylight = smoothstep(-0.12, 0.22, sunElevation)
  const goldenHour = smoothstep(-0.08, 0.04, sunElevation) * (1 - smoothstep(0.18, 0.55, sunElevation))
  const shadowTint = mixVec3(
    [0.1, 0.14, 0.26],
    mixVec3([0.05, 0.05, 0.06], [0.26, 0.14, 0.05], goldenHour),
    daylight,
  )
  const shadowCrispnessScale = 0.45 + 0.55 * smoothstep(0.05, 0.6, sunElevation)

  // Restyle the server-rendered shell when presets or debug controls change.
  // Memoized so per-frame sun-angle renders don't rewrite shell styles.
  useSceneShellStyle(
    useMemo(
      () => getHomeShellStyle({ background, font, textureSettings, typeSettings }),
      [background, font, textureSettings, typeSettings],
    ),
  )

  useEffect(() => {
    document.documentElement.style.background = backgroundMode.color
    document.body.style.background = backgroundMode.color
    return () => {
      document.documentElement.style.background = ''
      document.body.style.background = ''
    }
  }, [backgroundMode.color])

  useEffect(() => emitDebugTimelineEvent('app mounted'), [])

  // Take over the sun indicator from the server-rendered copy: identical
  // geometry, so the handoff to the animated version is invisible.
  useEffect(() => {
    const ssrWidget = document.querySelector<HTMLElement>('[data-ssr-sun-widget]')
    if (!ssrWidget) return
    ssrWidget.style.display = 'none'
    return () => {
      ssrWidget.style.display = 'contents'
    }
  }, [])

  useEffect(() => {
    let frameId = 0
    const updateResponsiveConfig = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        setResponsiveVisualConfig(getResponsiveVisualConfig(window.innerWidth, window.innerHeight))
      })
    }
    window.addEventListener('resize', updateResponsiveConfig)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateResponsiveConfig)
    }
  }, [])

  useEffect(() => {
    if (activeResponsivePresetRef.current === responsiveVisualConfig.appliedPreset) return
    activeResponsivePresetRef.current = responsiveVisualConfig.appliedPreset
    setBackground(responsiveVisualConfig.background)
    setFont(responsiveVisualConfig.font)
    setShadowMapMode(responsiveVisualConfig.shadowMapMode)
    setShadowSettings({ ...responsiveVisualConfig.shadowSettings })
    setTextureSettings({ ...responsiveVisualConfig.textureSettings })
    setTypeSettings({ ...responsiveVisualConfig.typeSettings })
    emitDebugTimelineEvent(
      'responsive preset',
      `${responsiveVisualConfig.sizeClass} -> ${responsiveVisualConfig.appliedPreset}`,
    )
  }, [responsiveVisualConfig])

  useEffect(() => {
    emitDebugTimelineEvent(
      shadowCapability.enabled ? 'capability ok' : 'capability blocked',
      shadowCapability.reasons.join(', '),
    )
  }, [shadowCapability.enabled, shadowCapability.reasons])

  useEffect(() => emitDebugTimelineEvent('mode selected', shadowMapMode), [shadowMapMode])

  useEffect(() => {
    emitDebugTimelineEvent(
      'shadow tuned',
      `${shadowSettings.speed.toFixed(2)} / ${shadowSettings.wind.toFixed(2)} / ${shadowSettings.crispness.toFixed(2)} / ${shadowSettings.opacity.toFixed(2)}`,
    )
  }, [shadowSettings.crispness, shadowSettings.opacity, shadowSettings.speed, shadowSettings.wind])

  useEffect(() => {
    if (!isDebug) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's' || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.shiftKey) {
        setShowShadowSource((isVisible) => !isVisible)
        emitDebugTimelineEvent('source preview toggled')
        return
      }
      setShadowMapMode((currentMode) => {
        const currentIndex = shadowMapModes.indexOf(currentMode)
        return shadowMapModes[(currentIndex + 1) % shadowMapModes.length]
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDebug])

  const logCurrentPreset = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const responsivePreset = getResponsiveVisualConfig(width, height)
    const preset = {
      appliedPreset: responsivePreset.appliedPreset,
      suggestedPreset: responsivePreset.sizeClass,
      viewport: {
        aspect: Number((width / Math.max(1, height)).toFixed(3)),
        devicePixelRatio: window.devicePixelRatio,
        height,
        width,
      },
      background,
      font,
      shadowMapMode,
      sunWidget,
      effectiveSunAngle: Number(effectiveSunAngle.toFixed(4)),
      shadowSettings,
      textureSettings,
      typeSettings,
    }
    console.info('[beneverman preset]', preset)
    console.info(`[beneverman preset:${responsivePreset.sizeClass}] ${JSON.stringify(preset, null, 2)}`)
    emitDebugTimelineEvent('preset logged', responsivePreset.sizeClass)
  }

  return (
    <>
      <div className="visual-scene-layer" aria-hidden="true">
        <HomeSunGradientLayer
          className={arrival.layerClassName('gradient')}
          mode={backgroundMode}
          onFirstFrame={() => arrival.markLive('gradient')}
          sunAngle={effectiveSunAngle}
        />
        {wantsShadowLayer ? (
          <DeferredShadowLayer
            className={arrival.layerClassName('shadow')}
            crispnessScale={shadowCrispnessScale}
            mode={shadowMapMode}
            onFirstFrame={() => arrival.markLive('shadow')}
            opacityScale={shadowFactor}
            settings={shadowSettings}
            shadowTint={shadowTint}
            sunAngle={effectiveSunAngle}
          />
        ) : null}
      </div>
      {sunWidget === 'none' ? null : (
        <HomeSunStatus angle={effectiveSunAngle} variant={sunWidget} />
      )}
      {isDebug ? (
        <HomeDebugPanel
          activeTab={debugPanelTab}
          background={background}
          capability={shadowCapability}
          currentMode={shadowMapMode}
          events={timelineEvents}
          font={font}
          isCollapsed={isDebugPanelCollapsed}
          onActiveTabChange={setDebugPanelTab}
          onBackgroundChange={setBackground}
          onChange={setShadowMapMode}
          onFontChange={setFont}
          onLogPreset={logCurrentPreset}
          onPreviewPick={(samplerX, samplerY) => {
            if (!shadowSourcePreview) return
            setShadowSettings((current) => ({
              ...current,
              samplerX: samplerX / shadowSourcePreview.width,
              samplerY: samplerY / shadowSourcePreview.height,
            }))
          }}
          onSettingsChange={setShadowSettings}
          onSunWidgetChange={setSunWidget}
          onTextureSettingsChange={setTextureSettings}
          onToggleCollapsed={() => setIsDebugPanelCollapsed((collapsed) => !collapsed)}
          onTypeSettingsChange={setTypeSettings}
          preview={shadowSourcePreview}
          settings={shadowSettings}
          showPreview={showShadowSource}
          sunWidget={sunWidget}
          textureSettings={textureSettings}
          typeSettings={typeSettings}
        />
      ) : null}
    </>
  )
}

export default App
