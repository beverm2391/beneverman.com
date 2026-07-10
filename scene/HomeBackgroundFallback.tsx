import type { CSSProperties } from 'react'
import type { BackgroundModeConfig } from './HomeSunGradientConfig'
import './HomeBackground.css'

function toRgb(channels: readonly [number, number, number]) {
  return `rgb(${channels.map((channel) => Math.round(channel * 255)).join(', ')})`
}

// A CSS-only first paint for the WebGL background. It deliberately uses the
// same palette and light direction as the shader so swapping in the first
// rendered frame reads as added detail instead of a new background flashing in.
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
  const gradientAngle = 90 - (sunAngle * 180) / Math.PI
  const style = {
    backgroundColor: mode.color,
    backgroundImage: [
      `radial-gradient(circle at ${sunX}% ${sunY}%, ${toRgb(mode.shader.glow)} 0%, transparent 44%)`,
      `linear-gradient(${gradientAngle}deg, ${toRgb(mode.shader.cool)} 0%, ${toRgb(mode.shader.mid)} 48%, ${toRgb(mode.shader.base)} 100%)`,
    ].join(', '),
  } satisfies CSSProperties

  return (
    <div
      aria-hidden="true"
      className={`background-fallback-layer${hidden ? ' is-hidden' : ''}`}
      style={style}
    />
  )
}
