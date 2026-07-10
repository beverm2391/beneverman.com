import type { DebugTimelineEvent } from './debugTimeline'
import { HomeShadowDebugPanel } from './HomeShadowDebugPanel'
import {
  fontModes,
  type DebugPanelTab,
  type FontMode,
  type ShadowCapability,
  type ShadowSettings,
  type SunWidgetChoice,
  type TextureSettings,
  type TypeSettings,
} from './homeSceneTypes'
import type { BackgroundMode } from './HomeSunGradientConfig'
import type { ShadowMapMode } from './shadowMapModes'
import type { ShadowSourcePreview } from './shadowSourcePreview'

type Props = {
  activeTab: DebugPanelTab
  background: BackgroundMode
  capability: ShadowCapability
  currentMode: ShadowMapMode
  events: DebugTimelineEvent[]
  font: FontMode
  isCollapsed: boolean
  onActiveTabChange: (tab: DebugPanelTab) => void
  onBackgroundChange: (background: BackgroundMode) => void
  onChange: (mode: ShadowMapMode) => void
  onFontChange: (font: FontMode) => void
  onLogPreset: () => void
  onPreviewPick: (x: number, y: number) => void
  onSettingsChange: (settings: ShadowSettings) => void
  onSunWidgetChange: (widget: SunWidgetChoice) => void
  onTextureSettingsChange: (settings: TextureSettings) => void
  onToggleCollapsed: () => void
  onTypeSettingsChange: (settings: TypeSettings) => void
  preview: ShadowSourcePreview | null
  settings: ShadowSettings
  showPreview: boolean
  sunWidget: SunWidgetChoice
  textureSettings: TextureSettings
  typeSettings: TypeSettings
}

const typeControls = [
  { key: 'size', label: 'type size', min: 0.75, max: 1.3, step: 0.01, digits: 2 },
  { key: 'weight', label: 'type weight', min: 250, max: 650, step: 25, digits: 0 },
  { key: 'tracking', label: 'kerning', min: -0.04, max: 0.08, step: 0.005, digits: 3 },
  { key: 'lineHeight', label: 'line size', min: 1.1, max: 2, step: 0.05, digits: 2 },
  { key: 'width', label: 'line width', min: 20, max: 44, step: 0.5, digits: 1 },
] as const

export function HomeDebugPanel(props: Props) {
  const { activeTab, events, font, isCollapsed, onActiveTabChange, onFontChange, onLogPreset, onToggleCollapsed } = props
  const finalTime = Math.max(1, events.at(-1)?.time ?? 1)

  return (
    <div className={`site-debug-panel debug-panel ${isCollapsed ? 'is-collapsed' : ''}`} aria-label="Debug controls">
      <div className="debug-panel-header">
        <span>debug</span>
        <button aria-expanded={!isCollapsed} aria-label="Toggle debug controls" onClick={onToggleCollapsed} type="button">
          {isCollapsed ? '+' : '-'}
        </button>
      </div>
      {isCollapsed ? null : (
        <>
          <div className="debug-panel-tabs" aria-label="Debug panel sections">
            {(['shadow', 'type', 'logs'] as const).map((tab) => (
              <button aria-pressed={activeTab === tab} key={tab} onClick={() => onActiveTabChange(tab)} type="button">
                {tab}
              </button>
            ))}
          </div>
          <div className="debug-panel-actions">
            <button onClick={onLogPreset} type="button">log preset</button>
          </div>

          {activeTab === 'shadow' ? <HomeShadowDebugPanel {...props} /> : null}
          {activeTab === 'type' ? (
            <>
              <div className="shadow-map-buttons shadow-font-buttons" aria-label="Text font">
                {fontModes.map((mode) => (
                  <button
                    aria-pressed={font === mode.label}
                    key={mode.label}
                    onClick={() => onFontChange(mode.label)}
                    type="button"
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="shadow-animation-controls">
                {typeControls.map((control) => (
                  <label key={control.key}>
                    <span>{control.label}</span>
                    <span>{props.typeSettings[control.key].toFixed(control.digits)}</span>
                    <input
                      max={control.max}
                      min={control.min}
                      onChange={(event) =>
                        props.onTypeSettingsChange({
                          ...props.typeSettings,
                          [control.key]: Number(event.currentTarget.value),
                        })
                      }
                      step={control.step}
                      type="range"
                      value={props.typeSettings[control.key]}
                    />
                  </label>
                ))}
              </div>
            </>
          ) : null}
          {activeTab === 'logs' ? (
            <div className="shadow-timeline" aria-label="Shadow timeline">
              {events.map((event) => (
                <div className="shadow-timeline-event" key={`${event.label}-${event.time}`}>
                  <span className="shadow-timeline-marker" style={{ left: `${(event.time / finalTime) * 100}%` }} />
                  <span>{event.label}</span>
                  <span>{Math.round(event.time)}ms</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
