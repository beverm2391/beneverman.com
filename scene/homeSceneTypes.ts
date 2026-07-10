import type { BackgroundMode } from './HomeSunGradientConfig'
import type { ShadowMapMode } from './shadowMapModes'
import type { ShadowSettings } from './shadowSettings'
import { sunWidgetVariants, type SunWidgetVariant } from './SunWidget'

export type { ShadowSettings } from './shadowSettings'

export type Vec3 = readonly [number, number, number]

export type TypeSettings = {
  lineHeight: number
  size: number
  tracking: number
  weight: number
  width: number
}

export type TextureSettings = {
  opacity: number
  scale: number
}

export type DebugPanelTab = 'shadow' | 'type' | 'logs'
export type VisualSizeClass = 'mobilePortrait' | 'tabletPortrait' | 'desktop' | 'desktopWide'
export type AppliedVisualPreset = 'mobile' | 'desktop'
export type SunWidgetChoice = SunWidgetVariant | 'none'

export const sunWidgetChoices = ['none', ...sunWidgetVariants] as const

export const fontModes = [
  { label: 'inter', stack: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif' },
  { label: 'geist', stack: 'Geist, var(--font-inter), ui-sans-serif, sans-serif' },
  { label: 'open sans', stack: '"Open Sans", var(--font-inter), ui-sans-serif, sans-serif' },
  { label: 'rubik', stack: 'Rubik, var(--font-inter), ui-sans-serif, sans-serif' },
] as const

export type FontMode = (typeof fontModes)[number]['label']

export type ResponsiveVisualConfig = {
  appliedPreset: AppliedVisualPreset
  sizeClass: VisualSizeClass
  background: BackgroundMode
  font: FontMode
  shadowMapMode: ShadowMapMode
  shadowSettings: ShadowSettings
  textureSettings: TextureSettings
  typeSettings: TypeSettings
}
