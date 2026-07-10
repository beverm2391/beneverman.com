import type { CSSProperties } from 'react'
import { backgroundModes, type BackgroundMode } from './HomeSunGradientConfig'
import { activeSiteConfig } from './siteScene'
import { siteVisualConfig } from './siteVisualConfig'

const fontStacks = {
  geist: 'Geist, var(--font-inter), ui-sans-serif, sans-serif',
  inter: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  'open sans': '"Open Sans", var(--font-inter), ui-sans-serif, sans-serif',
  rubik: 'Rubik, var(--font-inter), ui-sans-serif, sans-serif',
} as const

export type HomeIntroStyle = CSSProperties & Record<`--${string}`, string | number>

type HomeIntroStyleOptions = {
  font?: keyof typeof fontStacks
  typeSettings?: {
    lineHeight: number
    size: number
    tracking: number
    weight: number
    width: number
  }
}

export function getHomeIntroStyle(options: HomeIntroStyleOptions = {}): HomeIntroStyle {
  const font = options.font ?? siteVisualConfig.font
  const typeSettings = options.typeSettings ?? siteVisualConfig.typeSettings
  return {
    '--intro-font-family': fontStacks[font],
    '--intro-font-size': `${typeSettings.size}rem`,
    '--intro-font-weight': typeSettings.weight,
    '--intro-letter-spacing': `${typeSettings.tracking}em`,
    '--intro-line-height': typeSettings.lineHeight,
    '--intro-max-width': `${typeSettings.width}rem`,
    '--site-inline-padding': 'clamp(1.25rem, 4vw, 4rem)',
  }
}

type HomeShellStyleOptions = HomeIntroStyleOptions & {
  background?: BackgroundMode
  textureSettings?: {
    opacity: number
    scale: number
  }
}

// The full inline style for the site shell <main>: the server page renders it
// with config defaults, and App re-applies it (via useSceneShellStyle) when
// responsive presets or debug controls change any of the inputs.
export function getHomeShellStyle(options: HomeShellStyleOptions = {}): HomeIntroStyle {
  const textureSettings = options.textureSettings ?? siteVisualConfig.textureSettings
  const backgroundLabel = options.background ?? activeSiteConfig.background
  const backgroundMode =
    backgroundModes.find((mode) => mode.label === backgroundLabel) ?? backgroundModes[0]
  return {
    ...getHomeIntroStyle(options),
    '--texture-opacity': textureSettings.opacity,
    '--texture-scale': `${textureSettings.scale}px`,
    backgroundColor: backgroundMode.color,
  }
}
