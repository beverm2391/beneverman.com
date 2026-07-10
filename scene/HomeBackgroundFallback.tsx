import type { CSSProperties } from 'react'
import type { BackgroundModeConfig } from './HomeSunGradientConfig'
import './primitives/sceneFade.css'

type Rgb = readonly [number, number, number]

function toRgb(channels: Rgb) {
  return `rgb(${channels.map((channel) => Math.round(channel * 255)).join(', ')})`
}

function toRgba(channels: Rgb, alpha: number) {
  return `rgba(${channels.map((channel) => Math.round(channel * 255)).join(', ')}, ${alpha})`
}

function mix3(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

// A CSS-only first paint for the WebGL background. The color math is ported
// from home-background.frag.glsl (paperSide/sunSide at typical daylight) so
// this approximates the shader at its entrance floor: the seam cross-fade is
// then between two near-identical images, and the shader's uEntrance lerp
// carries the visible motion. If the shader's palette math changes, re-derive
// these mixes.
export function HomeBackgroundFallback({
  hidden = false,
  mode,
  sunAngle,
}: {
  hidden?: boolean
  mode: BackgroundModeConfig
  sunAngle: number
}) {
  const sunX = 50 + Math.cos(sunAngle) * 48
  const sunY = 50 - Math.sin(sunAngle) * 44
  // linear-gradient angles point at the 100% stop; this puts it on the sun's
  // side of the page, matching the shader's directional wash.
  const gradientAngle = 90 - (sunAngle * 180) / Math.PI

  // Same daylight/golden-hour terms as the shader: at the site's config sun
  // angle golden hour is nearly full, which warms the glow toward orange and
  // boosts its strength ~1.9x. Omitting these was a visible flash at the swap.
  const sunElevation = Math.sin(sunAngle)
  const daylight = smoothstep(-0.12, 0.22, sunElevation)
  const goldenHour = smoothstep(-0.08, 0.04, sunElevation) * (1 - smoothstep(0.18, 0.55, sunElevation))
  const glowTint = mix3(mode.shader.glow, [1, 0.66, 0.42], goldenHour * 0.6)
  const glowBoost = (0.12 + 0.88 * daylight) * (1 + goldenHour * 0.9)

  const paperSide = mix3(mode.shader.base, [0.985, 0.965, 0.925], 0.46)
  let sunSide = mix3(glowTint, [1, 0.82, 0.5], 0.24)
  sunSide = mix3(sunSide, [1, 0.72, 0.5], goldenHour * 0.35)
  // The shader at entrance floor E shows roughly mix(paperSide, sunSide, E)
  // toward the sun; keep these stops in sync with uEntrance's floor. (Night
  // is not modeled: the site config always starts in daylight.)
  const sunEnd = mix3(paperSide, sunSide, 0.5)
  const midStop = mix3(paperSide, sunSide, 0.22)

  const style = {
    backgroundColor: mode.color,
    backgroundImage: [
      `radial-gradient(circle at ${sunX}% ${sunY}%, ${toRgba(glowTint, Math.min(0.85, 0.5 * glowBoost))} 0%, transparent 60%)`,
      `linear-gradient(${gradientAngle}deg, ${toRgb(paperSide)} 0%, ${toRgb(midStop)} 55%, ${toRgb(sunEnd)} 100%)`,
    ].join(', '),
  } satisfies CSSProperties

  return (
    <div
      aria-hidden="true"
      className={`scene-fallback-layer${hidden ? ' is-hidden' : ''}`}
      style={style}
    />
  )
}
