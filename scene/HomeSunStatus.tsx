import { SunWidget, type SunWidgetVariant } from './SunWidget'
import { cycleTimeAtSunAngle, formatTimeOfDay, sunCycleDurationSeconds } from './sunClock'

export function HomeSunStatus({ angle, variant }: { angle: number; variant: SunWidgetVariant }) {
  return (
    <div className="sun-angle-widget" aria-hidden="true">
      <SunWidget angle={angle} variant={variant} />
      <span className="sun-widget-clock">
        {formatTimeOfDay(cycleTimeAtSunAngle(Math.PI - angle) / sunCycleDurationSeconds)}
      </span>
    </div>
  )
}
