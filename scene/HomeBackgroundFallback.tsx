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

  const paperSide = mix3(mode.shader.base, [0.985, 0.965, 0.925], 0.46)
  const sunSide = mix3(mode.shader.glow, [1, 0.82, 0.5], 0.24)
  // The shader at entrance floor E shows roughly mix(paperSide, sunSide, E)
  // toward the sun; keep these stops in sync with uEntrance's floor.
  const sunEnd = mix3(paperSide, sunSide, 0.5)
  const midStop = mix3(paperSide, sunSide, 0.22)

  const style = {
    backgroundColor: mode.color,
    backgroundImage: [
      `radial-gradient(circle at ${sunX}% ${sunY}%, ${toRgba(mode.shader.glow, 0.55)} 0%, transparent 60%)`,
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
