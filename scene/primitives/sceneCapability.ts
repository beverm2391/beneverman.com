import { useEffect, useState } from 'react'

// Gate for expensive scene layers (WebGL shadows, heavy shaders). A layer is
// only worth rendering when the device and the user's preferences allow it;
// otherwise the CSS-only fallback stays. Reasons are kept for the debug panel.
export type SceneCapability = {
  enabled: boolean
  reasons: string[]
}

type BatteryStatus = { charging: boolean; level: number }

type NavigatorWithEffectHints = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean }
  deviceMemory?: number
  getBattery?: () => Promise<BatteryStatus>
}

function getSceneCapability(battery?: BatteryStatus | null): SceneCapability {
  const hints = navigator as NavigatorWithEffectHints
  const reasons: string[] = []
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const effectiveType = hints.connection?.effectiveType

  if (reducedMotion) reasons.push('reduced motion')
  if (hints.connection?.saveData) reasons.push('data saver')
  if (effectiveType === 'slow-2g' || effectiveType === '2g') reasons.push(effectiveType)
  if (typeof hints.deviceMemory === 'number' && hints.deviceMemory <= 2) reasons.push(`${hints.deviceMemory}gb memory`)
  if (navigator.hardwareConcurrency <= 2) reasons.push(`${navigator.hardwareConcurrency} cores`)
  if (battery && !battery.charging && battery.level <= 0.2) reasons.push('low battery')
  return { enabled: reasons.length === 0, reasons: reasons.length > 0 ? reasons : ['ok'] }
}

export function useSceneCapability() {
  const [battery, setBattery] = useState<BatteryStatus | null>(null)
  const [capability, setCapability] = useState(() => getSceneCapability())

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const refresh = () => setCapability(getSceneCapability(battery))
    motionQuery.addEventListener('change', refresh)
    refresh()
    return () => motionQuery.removeEventListener('change', refresh)
  }, [battery])

  useEffect(() => {
    const hints = navigator as NavigatorWithEffectHints
    let cancelled = false
    void hints.getBattery?.().then((nextBattery) => {
      if (cancelled) return
      setBattery(nextBattery)
      setCapability(getSceneCapability(nextBattery))
    })
    return () => {
      cancelled = true
    }
  }, [])
  return capability
}
