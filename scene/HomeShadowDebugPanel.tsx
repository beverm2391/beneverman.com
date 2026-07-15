import { useState } from 'react'
import { backgroundModes, type BackgroundMode } from './HomeSunGradientConfig'
import type {
  ShadowSettings,
  SunWidgetChoice,
  TextureSettings,
} from './homeSceneTypes'
import type { SceneCapability } from './primitives/sceneCapability'
import { canopyStyles, shadowMapModes, type ShadowMapMode } from './shadowMapModes'
import type { ShadowSourcePreview } from './shadowSourcePreview'
import { ShadowSourcePreviewPanel } from './ShadowSourcePreviewPanel'
import { cycleTimeAtSunAngle, formatTimeOfDay, sunAngleAtCycleTime, sunCycleDurationSeconds } from './sunClock'
import { sunWidgetChoices } from './homeSceneTypes'

type ShadowConfigTab = 'scene' | 'layers'
type ShadowLayerTab = 'blinds' | 'canopy'

type Props = {
  background: BackgroundMode
  capability: SceneCapability
  currentMode: ShadowMapMode
  onBackgroundChange: (background: BackgroundMode) => void
  onChange: (mode: ShadowMapMode) => void
  onPreviewPick: (x: number, y: number) => void
  onSettingsChange: (settings: ShadowSettings) => void
  onSunWidgetChange: (widget: SunWidgetChoice) => void
  onTextureSettingsChange: (settings: TextureSettings) => void
  preview: ShadowSourcePreview | null
  settings: ShadowSettings
  showPreview: boolean
  sunWidget: SunWidgetChoice
  textureSettings: TextureSettings
}

type RangeControlProps = {
  display: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}

function RangeControl({ display, label, max, min, onChange, step, value }: RangeControlProps) {
  return (
    <label>
      <span>{label}</span>
      <span>{display}</span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  )
}

const sceneControls = [
  { key: 'depthMix', label: 'depth mix', min: 0, max: 1, step: 0.01 },
  { key: 'layerSpread', label: 'layer spread', min: 0.25, max: 2.5, step: 0.05 },
  { key: 'speed', label: 'speed', min: 0, max: 4, step: 0.05 },
  { key: 'wind', label: 'wind', min: 0, max: 6, step: 0.05 },
  { key: 'crispness', label: 'crispness', min: 0.45, max: 3, step: 0.05 },
  { key: 'opacity', label: 'opacity', min: 0, max: 0.7, step: 0.01 },
  { key: 'lightGlow', label: 'light glow', min: 0, max: 1.5, step: 0.05 },
  { key: 'lightRays', label: 'light rays', min: 0, max: 4, step: 0.05 },
  { key: 'rayDiffusion', label: 'ray diffusion', min: 0, max: 1, step: 0.05 },
  { key: 'contrast', label: 'contrast', min: 0.3, max: 2.5, step: 0.05 },
  { key: 'scale', label: 'source scale', min: 0.45, max: 1.8, step: 0.05 },
  { key: 'density', label: 'source density', min: 0.35, max: 1.8, step: 0.05 },
  { key: 'sampleCount', label: 'samples', min: 24, max: 100, step: 4 },
  { key: 'resolution', label: 'resolution', min: 0.35, max: 1.25, step: 0.05 },
] as const

export function HomeShadowDebugPanel(props: Props) {
  const {
    background,
    capability,
    currentMode,
    onBackgroundChange,
    onChange,
    onPreviewPick,
    onSettingsChange,
    onSunWidgetChange,
    onTextureSettingsChange,
    preview,
    settings,
    showPreview,
    sunWidget,
    textureSettings,
  } = props
  const [configTab, setConfigTab] = useState<ShadowConfigTab>('scene')
  const [layerTab, setLayerTab] = useState<ShadowLayerTab>('blinds')
  const timeOfDayFraction = cycleTimeAtSunAngle(Math.PI - settings.sunAngle) / sunCycleDurationSeconds

  return (
    <>
      <div className="shadow-effect-status">
        <span>{capability.enabled ? 'shadow on' : 'shadow off'}</span>
        <span>{capability.reasons.join(', ')}</span>
      </div>
      <div className="shadow-effect-status">
        <span>caster map</span>
        <span>{preview ? `${preview.width}×${preview.height}` : 'waiting'}</span>
      </div>
      <div className="shadow-map-buttons">
        {shadowMapModes.map((mode) => (
          <button aria-pressed={currentMode === mode} key={mode} onClick={() => onChange(mode)} type="button">
            {mode}
          </button>
        ))}
      </div>
      <div className="shadow-map-buttons" aria-label="Canopy style">
        {canopyStyles.map((style) => (
          <button
            aria-pressed={settings.canopyStyle === style}
            key={style}
            onClick={() => onSettingsChange({ ...settings, canopyStyle: style })}
            type="button"
          >
            {style}
          </button>
        ))}
      </div>
      <div className="shadow-map-buttons shadow-background-buttons" aria-label="Background color">
        {backgroundModes.map((mode) => (
          <button
            aria-pressed={background === mode.label}
            key={mode.label}
            onClick={() => onBackgroundChange(mode.label)}
            style={{ ['--swatch-color' as string]: mode.color }}
            type="button"
          >
            <span className="shadow-background-swatch" />
            {mode.label}
          </button>
        ))}
      </div>
      <div className="shadow-map-buttons shadow-widget-buttons" aria-label="Sun widget">
        {sunWidgetChoices.map((choice) => (
          <button aria-pressed={sunWidget === choice} key={choice} onClick={() => onSunWidgetChange(choice)} type="button">
            {choice}
          </button>
        ))}
      </div>
      <div className="shadow-map-buttons shadow-config-tabs" aria-label="Shadow config sections">
        {(['scene', 'layers'] as const).map((tab) => (
          <button aria-pressed={configTab === tab} key={tab} onClick={() => setConfigTab(tab)} type="button">
            {tab}
          </button>
        ))}
      </div>

      {configTab === 'scene' ? (
        <>
          <div className="shadow-animation-controls">
            <RangeControl
              display={textureSettings.opacity.toFixed(2)}
              label="texture opacity"
              max={0.8}
              min={0}
              onChange={(opacity) => onTextureSettingsChange({ ...textureSettings, opacity })}
              step={0.01}
              value={textureSettings.opacity}
            />
            <RangeControl
              display={String(Math.round(textureSettings.scale))}
              label="texture scale"
              max={900}
              min={24}
              onChange={(scale) => onTextureSettingsChange({ ...textureSettings, scale })}
              step={4}
              value={textureSettings.scale}
            />
          </div>
          <div className="shadow-animation-controls">
            {sceneControls.slice(0, 3).map((control) => (
              <RangeControl
                {...control}
                display={settings[control.key].toFixed(2)}
                key={control.key}
                onChange={(value) => onSettingsChange({ ...settings, [control.key]: value })}
                value={settings[control.key]}
              />
            ))}
            <RangeControl
              display={formatTimeOfDay(timeOfDayFraction)}
              label="time of day"
              max={1}
              min={0}
              onChange={(fraction) =>
                onSettingsChange({
                  ...settings,
                  sunAngle: Math.PI - sunAngleAtCycleTime(fraction * sunCycleDurationSeconds),
                })
              }
              step={0.002}
              value={timeOfDayFraction}
            />
            {sceneControls.slice(3).map((control) => (
              <RangeControl
                {...control}
                display={control.key === 'sampleCount' ? String(Math.round(settings[control.key])) : settings[control.key].toFixed(2)}
                key={control.key}
                onChange={(value) => onSettingsChange({ ...settings, [control.key]: value })}
                value={settings[control.key]}
              />
            ))}
          </div>
        </>
      ) : null}

      {configTab === 'layers' ? (
        <>
          <div className="shadow-map-buttons shadow-layer-tabs" aria-label="Shadow layers">
            {(['blinds', 'canopy'] as const).map((layer) => (
              <button aria-pressed={layerTab === layer} key={layer} onClick={() => setLayerTab(layer)} type="button">
                {layer}
              </button>
            ))}
          </div>
          <div className="shadow-animation-controls">
            <RangeControl
              display={(layerTab === 'blinds' ? settings.blindStrength : settings.canopyStrength).toFixed(2)}
              label="strength"
              max={1.5}
              min={0}
              onChange={(value) =>
                onSettingsChange({
                  ...settings,
                  [layerTab === 'blinds' ? 'blindStrength' : 'canopyStrength']: value,
                })
              }
              step={0.01}
              value={layerTab === 'blinds' ? settings.blindStrength : settings.canopyStrength}
            />
          </div>
        </>
      ) : null}
      {showPreview ? <ShadowSourcePreviewPanel onPick={onPreviewPick} preview={preview} /> : null}
    </>
  )
}
