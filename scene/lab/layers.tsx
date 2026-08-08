// Layer registry: the single source of truth for every layer type the lab can
// compose. Adding a new layer type = add one entry here (default config,
// control schema, render). The sidebar and renderer are schema-driven, so
// nothing else needs to change.

import { DitherFieldLayer, type DitherFieldSettings } from '../DitherFieldLayer'
import { HomeIntro } from '../HomeIntro'
import { HomeSunGradientLayer } from '../HomeSunGradientLayer'
import { backgroundModes } from '../HomeSunGradientConfig'
import { getHomeIntroStyle, type HomeIntroStyle } from '../homeVisualConfig'
import { shadowMapModes, type ShadowMapMode } from '../shadowMapModes'
import { siteVisualConfig } from '../siteVisualConfig'
import { SunWidget, sunWidgetVariants, type SunWidgetVariant } from '../SunWidget'
import { cycleTimeAtSunAngle, formatTimeOfDay, sunCycleDurationSeconds } from '../sunClock'
import V2ShadowLayer, { type ShadowSettings } from '../V2ShadowLayer'
import {
  newInstanceId,
  slugify,
  type LayerConfig,
  type LayerInstance,
  type LayerType,
  type Scene,
  type SceneTheme,
} from './scene'

const NEUTRAL_TINT = [0.08, 0.09, 0.12] as const

export type Control =
  | { kind: 'slider'; key: string; label: string; min: number; max: number; step: number }
  | { kind: 'select'; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: 'switch'; key: string; label: string }
  | { kind: 'color'; key: string; label: string }

export type LayerDef = {
  type: LayerType
  label: string
  defaultConfig: LayerConfig
  controls: Control[]
  // Layers that can render a raw-geometry inspector get a mesh button in their
  // header; it toggles the boolean `inspect` config key.
  inspectable?: boolean
  // `theme` is the lab's transient light/dark preview: themed layers pick
  // their light or dark config value; everything else ignores it.
  Render: (props: { config: LayerConfig; sunAngle: number; theme: SceneTheme }) => React.ReactNode
}

const num = (config: LayerConfig, key: string, fallback: number) =>
  typeof config[key] === 'number' ? (config[key] as number) : fallback

const str = (config: LayerConfig, key: string, fallback: string) =>
  typeof config[key] === 'string' ? (config[key] as string) : fallback

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return [0.09, 0.09, 0.1]
  const value = parseInt(match[1], 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

// The shadow layer exposes a curated subset of ShadowSettings; everything else
// falls back to the production preset in siteVisualConfig.
const SHADOW_KNOBS = [
  { key: 'lightGlow', label: 'Light glow', min: 0, max: 1, step: 0.01 },
  { key: 'opacity', label: 'Shadow opacity', min: 0, max: 0.6, step: 0.01 },
  { key: 'contrast', label: 'Contrast', min: 0, max: 1.5, step: 0.01 },
  { key: 'depthMix', label: 'Depth mix', min: 0, max: 1, step: 0.01 },
  { key: 'density', label: 'Density', min: 0.2, max: 2, step: 0.05 },
  { key: 'scale', label: 'Scale', min: 0.5, max: 2.5, step: 0.05 },
] as const

const sunGradient: LayerDef = {
  type: 'sunGradient',
  label: 'Sun gradient',
  defaultConfig: { mode: siteVisualConfig.background },
  controls: [
    {
      kind: 'select',
      key: 'mode',
      label: 'Palette',
      options: backgroundModes.map((mode) => ({ value: mode.label, label: mode.label })),
    },
  ],
  Render: ({ config, sunAngle }) => {
    const mode = backgroundModes.find((m) => m.label === config.mode) ?? backgroundModes[0]
    return <HomeSunGradientLayer mode={mode} sunAngle={sunAngle} />
  },
}

// The base paper: a solid fill at (conventionally) the bottom of the stack,
// carrying one color per theme like the real site's --bg token.
const paper: LayerDef = {
  type: 'paper',
  label: 'Paper',
  defaultConfig: { light: '#faf9f6', dark: '#161616' },
  controls: [
    { kind: 'color', key: 'light', label: 'Light color' },
    { kind: 'color', key: 'dark', label: 'Dark color' },
  ],
  Render: ({ config, theme }) => (
    <div
      aria-hidden
      className="lab-paper-layer"
      style={{ background: str(config, theme, theme === 'dark' ? '#161616' : '#faf9f6') }}
    />
  ),
}

const text: LayerDef = {
  type: 'text',
  label: 'Homepage text',
  defaultConfig: {
    opacity: 1,
    weight: siteVisualConfig.typeSettings.weight,
    color: '#1c1c1c',
    colorDark: '#f5f5f5',
  },
  controls: [
    { kind: 'slider', key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.01 },
    // Geist's variable range is 250-650 (globals.css @font-face).
    { kind: 'slider', key: 'weight', label: 'Weight', min: 250, max: 650, step: 10 },
    { kind: 'color', key: 'color', label: 'Color (light)' },
    { kind: 'color', key: 'colorDark', label: 'Color (dark)' },
  ],
  Render: ({ config, theme }) => {
    const weight = num(config, 'weight', siteVisualConfig.typeSettings.weight)
    const color =
      theme === 'dark' ? str(config, 'colorDark', '#f5f5f5') : str(config, 'color', '#1c1c1c')
    const style: HomeIntroStyle = {
      ...getHomeIntroStyle({ typeSettings: { ...siteVisualConfig.typeSettings, weight } }),
      opacity: num(config, 'opacity', 1),
      // Consumed by App.css .intro rules (falls back to the ink default).
      '--intro-color': color,
    }
    return (
      <div className="lab-text-layer" style={style}>
        <HomeIntro />
      </div>
    )
  },
}

const shadow: LayerDef = {
  type: 'shadow',
  label: 'Shadow',
  // Mesh inspector (header button) shows the raw caster map instead of the
  // shaded result. It's a transient view toggle (lab state), not saved config;
  // the Render still reads a `config.inspect` flag injected at render time.
  inspectable: true,
  defaultConfig: {
    preset: 'sundial',
    lightGlow: 0.6,
    opacity: 0.19,
    contrast: 0.9,
    depthMix: 0.75,
    density: 1,
    scale: 1.4,
  },
  controls: [
    {
      kind: 'select',
      key: 'preset',
      label: 'Preset',
      options: shadowMapModes.map((mode) => ({ value: mode, label: mode })),
    },
    ...SHADOW_KNOBS.map((knob) => ({ kind: 'slider' as const, ...knob })),
  ],
  Render: ({ config, sunAngle }) => {
    const settings = { ...siteVisualConfig.shadowSettings, sunAngle } as ShadowSettings
    for (const { key } of SHADOW_KNOBS) {
      settings[key] = num(config, key, settings[key])
    }
    const preset = (typeof config.preset === 'string' ? config.preset : 'sundial') as ShadowMapMode
    return (
      <V2ShadowLayer
        crispnessScale={1}
        mode={preset}
        opacityScale={1}
        settings={settings}
        shadowTint={NEUTRAL_TINT}
        showSource={config.inspect === true}
        sunAngle={sunAngle}
      />
    )
  },
}

const sunWidget: LayerDef = {
  type: 'sunWidget',
  label: 'Sun indicator',
  defaultConfig: { variant: 'gnomon', showTime: false },
  controls: [
    {
      kind: 'select',
      key: 'variant',
      label: 'Style',
      options: sunWidgetVariants.map((variant) => ({ value: variant, label: variant })),
    },
    { kind: 'switch', key: 'showTime', label: 'Show time' },
  ],
  Render: ({ config, sunAngle }) => {
    const variant = (sunWidgetVariants as readonly string[]).includes(config.variant as string)
      ? (config.variant as SunWidgetVariant)
      : 'gnomon'
    const time = formatTimeOfDay(cycleTimeAtSunAngle(Math.PI - sunAngle) / sunCycleDurationSeconds)
    return (
      <div aria-hidden className="lab-sun-widget">
        <SunWidget angle={sunAngle} variant={variant} />
        {config.showTime === true ? <span className="sun-widget-clock">{time}</span> : null}
      </div>
    )
  },
}

// Dither/halftone/slat field (scene/INSPIRATION.md direction). The ink is
// themed: one color per theme, like paper and text. Not yet mapped by
// sceneToSiteConfig — promoting a scene with this layer silently drops it on
// the homepage until the direction settles and the mapping is written.
// Legacy configs stored ink as a named select value; keep them resolving.
const LEGACY_DITHER_INKS: Record<string, string> = {
  ink: '#262629',
  cream: '#f5f2ea',
}

function ditherInk(config: LayerConfig, theme: SceneTheme): [number, number, number] {
  const key = theme === 'dark' ? 'inkDark' : 'ink'
  const fallback = theme === 'dark' ? '#f5f2ea' : '#262629'
  const raw = str(config, key, fallback)
  return hexToRgb(LEGACY_DITHER_INKS[raw] ?? raw)
}

const ditherField: LayerDef = {
  type: 'ditherField',
  label: 'Dither field',
  defaultConfig: {
    pattern: 'halftone',
    source: 'blobs',
    contrast: 1,
    cell: 10,
    angle: 0,
    blobs: 3,
    blobScale: 0.3,
    speed: 0.5,
    bias: 0,
    jitter: 0.5,
    slatFill: 0.7,
    ink: '#262629',
    inkDark: '#f5f2ea',
    opacity: 1,
    invert: false,
    sourceOnly: false,
  },
  controls: [
    {
      kind: 'select',
      key: 'pattern',
      label: 'Pattern',
      options: [
        { value: 'halftone', label: 'halftone dots' },
        { value: 'bayer', label: 'bayer cells' },
        { value: 'slats', label: 'scanline slats' },
        { value: 'smooth', label: 'smooth (bare field)' },
      ],
    },
    {
      kind: 'select',
      key: 'source',
      label: 'Field source',
      options: [
        { value: 'blobs', label: 'own blobs' },
        { value: 'below', label: 'layers below' },
      ],
    },
    { kind: 'slider', key: 'contrast', label: 'Field contrast', min: 0.25, max: 6, step: 0.05 },
    { kind: 'slider', key: 'cell', label: 'Cell size', min: 3, max: 28, step: 1 },
    { kind: 'slider', key: 'angle', label: 'Pattern angle', min: 0, max: 90, step: 1 },
    { kind: 'slider', key: 'blobs', label: 'Blobs', min: 1, max: 6, step: 1 },
    { kind: 'slider', key: 'blobScale', label: 'Blob size', min: 0.1, max: 0.7, step: 0.01 },
    { kind: 'slider', key: 'speed', label: 'Drift speed', min: 0, max: 2, step: 0.05 },
    { kind: 'slider', key: 'bias', label: 'Density bias', min: -0.4, max: 0.4, step: 0.01 },
    { kind: 'slider', key: 'jitter', label: 'Slat jitter', min: 0, max: 1, step: 0.01 },
    { kind: 'slider', key: 'slatFill', label: 'Slat fill', min: 0.3, max: 0.95, step: 0.01 },
    { kind: 'color', key: 'ink', label: 'Ink (light)' },
    { kind: 'color', key: 'inkDark', label: 'Ink (dark)' },
    { kind: 'slider', key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.01 },
    { kind: 'switch', key: 'invert', label: 'Invert field' },
    { kind: 'switch', key: 'sourceOnly', label: 'Source only (invisible)' },
  ],
  Render: ({ config, theme }) => {
    const settings: DitherFieldSettings = {
      pattern:
        config.pattern === 'bayer' || config.pattern === 'slats' || config.pattern === 'smooth'
          ? config.pattern
          : 'halftone',
      source: config.source === 'below' ? 'below' : 'blobs',
      contrast: num(config, 'contrast', 1),
      cell: num(config, 'cell', 10),
      angleDeg: num(config, 'angle', 0),
      blobs: num(config, 'blobs', 3),
      blobScale: num(config, 'blobScale', 0.3),
      speed: num(config, 'speed', 0.5),
      bias: num(config, 'bias', 0),
      jitter: num(config, 'jitter', 0.5),
      slatFill: num(config, 'slatFill', 0.7),
      ink: ditherInk(config, theme),
      opacity: num(config, 'opacity', 1),
      invert: config.invert === true,
      sourceOnly: config.sourceOnly === true,
    }
    return <DitherFieldLayer settings={settings} />
  },
}

export const LAYER_REGISTRY: Record<LayerType, LayerDef> = {
  sunGradient,
  text,
  shadow,
  sunWidget,
  ditherField,
  paper,
}

// Order shown in the "add layer" picker; also the default new-scene stack
// (top of the list = front-most, so paper is the ground).
export const LAYER_TYPES: LayerType[] = [
  'sunWidget',
  'shadow',
  'text',
  'sunGradient',
  'ditherField',
  'paper',
]

export function getLayerDef(type: LayerType): LayerDef {
  return LAYER_REGISTRY[type]
}

export function createLayerInstance(type: LayerType): LayerInstance {
  return {
    instanceId: newInstanceId(),
    type,
    enabled: true,
    config: { ...getLayerDef(type).defaultConfig },
  }
}

// A fresh scene. The seeded starter passes the full default stack; "New" in
// the lab passes [] so experiments start from a blank canvas and layers are
// added deliberately.
export function createScene(name: string, types: LayerType[] = LAYER_TYPES): Scene {
  return {
    id: slugify(name),
    name,
    sunAngle: siteVisualConfig.shadowSettings.sunAngle,
    layers: types.map(createLayerInstance),
  }
}
