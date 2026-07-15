import { lazy, useEffect, useRef, useState } from 'react'
import {
  emitDebugTimelineEvent,
  getDebugTimelineEvents,
  subscribeDebugTimeline,
  type DebugTimelineEvent,
} from './debugTimeline'
import type {
  AppliedVisualPreset,
  ResponsiveVisualConfig,
  VisualSizeClass,
} from './homeSceneTypes'
import { activeSiteConfig } from './siteScene'
import { siteVisualConfig } from './siteVisualConfig'
import {
  getShadowSourcePreview,
  subscribeShadowSourcePreview,
  type ShadowSourcePreview,
} from './shadowSourcePreview'
import { cycleTimeAtSunAngle, sunAngleAtCycleTime, sunCycleDurationSeconds } from './sunClock'

const debugFontStylesheet =
  'https://fonts.googleapis.com/css2?family=Inter:wght@250..650&family=Open+Sans:wght@250..650&family=Rubik:wght@250..650&display=optional'

export function useDeferredFontStylesheet(isDebug: boolean) {
  useEffect(() => {
    if (!isDebug) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let idleId: number | undefined

    const loadFonts = () => {
      if (document.querySelector(`link[href="${debugFontStylesheet}"]`)) return
      for (const href of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
        const preconnect = document.createElement('link')
        preconnect.rel = 'preconnect'
        preconnect.href = href
        preconnect.crossOrigin = ''
        document.head.append(preconnect)
      }
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href = debugFontStylesheet
      document.head.append(stylesheet)
    }

    const scheduleFontLoad = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(loadFonts, { timeout: 1200 })
      } else {
        timeoutId = globalThis.setTimeout(loadFonts, 400)
      }
    }

    window.requestAnimationFrame(() => window.requestAnimationFrame(scheduleFontLoad))
    return () => {
      if (idleId !== undefined && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId)
    }
  }, [isDebug])
}

export function useDebugMode() {
  const readDebugMode = () => new URLSearchParams(window.location.search).has('debug')
  const [isDebug, setIsDebug] = useState(readDebugMode)
  useEffect(() => {
    const handlePopState = () => setIsDebug(readDebugMode())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  return isDebug
}

export function useDebugTimeline() {
  const [events, setEvents] = useState<DebugTimelineEvent[]>(getDebugTimelineEvents)
  useEffect(() => subscribeDebugTimeline(setEvents), [])
  return events
}

function getVisualSizeClass(width: number, height: number): VisualSizeClass {
  const aspect = width / Math.max(1, height)
  if (aspect < 0.78) return 'mobilePortrait'
  if (aspect < siteVisualConfig.responsivePresets.mobilePortrait.maxAspect) return 'tabletPortrait'
  if (aspect < 1.65) return 'desktop'
  return 'desktopWide'
}

export function getResponsiveVisualConfig(width: number, height: number): ResponsiveVisualConfig {
  const sizeClass = getVisualSizeClass(width, height)
  const appliedPreset: AppliedVisualPreset =
    sizeClass === 'mobilePortrait' || sizeClass === 'tabletPortrait' ? 'mobile' : 'desktop'
  const mobile = appliedPreset === 'mobile' ? siteVisualConfig.responsivePresets.mobilePortrait : undefined

  return {
    appliedPreset,
    sizeClass,
    background: activeSiteConfig.background,
    font: siteVisualConfig.font,
    shadowMapMode: activeSiteConfig.shadowMapMode,
    shadowSettings: { ...activeSiteConfig.shadowSettings, ...(mobile?.shadowSettings ?? {}) },
    textureSettings: { ...siteVisualConfig.textureSettings, ...(mobile?.textureSettings ?? {}) },
    typeSettings: { ...siteVisualConfig.typeSettings, ...(mobile?.typeSettings ?? {}) },
  }
}

export function useAnimatedSunAngle(baseSunAngle: number) {
  const [animatedAngle, setAnimatedAngle] = useState(baseSunAngle)
  const publishedAngleRef = useRef(baseSunAngle)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      publishedAngleRef.current = baseSunAngle
      const frameId = requestAnimationFrame(() => setAnimatedAngle(baseSunAngle))
      return () => cancelAnimationFrame(frameId)
    }
    let frameId = 0
    const startedAt = performance.now()
    const startCycleTime = cycleTimeAtSunAngle(Math.PI - baseSunAngle)
    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000
      const nextAngle = Math.PI - sunAngleAtCycleTime((startCycleTime + elapsed) % sunCycleDurationSeconds)
      // 0.0008 rad publishes ~24x/s. Coarser thresholds visibly tick the
      // sundial shadow's rotation. Profiling showed this churn is harmless
      // (zero long tasks; the page's cost is GPU-side), so smoothness wins.
      if (Math.abs(nextAngle - publishedAngleRef.current) > 0.0008) {
        publishedAngleRef.current = nextAngle
        setAnimatedAngle(nextAngle)
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [baseSunAngle])
  return animatedAngle
}

// Subscribing is what tells V2ShadowLayer to pay for preview readbacks, so
// only subscribe while the debug panel actually shows them.
export function useShadowSourcePreview(enabled: boolean) {
  const [preview, setPreview] = useState<ShadowSourcePreview | null>(getShadowSourcePreview)
  useEffect(() => {
    if (!enabled) return
    return subscribeShadowSourcePreview(setPreview)
  }, [enabled])
  return enabled ? preview : null
}

export const DeferredShadowLayer = lazy(() => {
  emitDebugTimelineEvent('chunk requested')
  return import('./V2ShadowLayer').then((module) => {
    emitDebugTimelineEvent('chunk loaded')
    return module
  })
})
