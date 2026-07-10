import { describe, expect, it } from "vitest";
import {
  cycleTimeAtSunAngle,
  formatTimeOfDay,
  sunAngleAtCycleTime,
  sunCycleDurationSeconds,
  sunDayDurationSeconds
} from "./sunClock";

describe("sun clock", () => {
  it.each([0, 0.2, Math.PI / 2, Math.PI, Math.PI * 1.4, Math.PI * 1.99])(
    "round-trips angle %s through cycle time",
    (angle) => {
      expect(sunAngleAtCycleTime(cycleTimeAtSunAngle(angle))).toBeCloseTo(angle, 10);
    }
  );

  it("joins day and night at the same horizon", () => {
    const epsilon = 0.0001;
    expect(sunAngleAtCycleTime(sunDayDurationSeconds - epsilon)).toBeCloseTo(Math.PI, 6);
    expect(sunAngleAtCycleTime(sunDayDurationSeconds + epsilon)).toBeCloseTo(Math.PI, 6);
  });

  it("maps the cycle to a readable 06:00 through midnight clock", () => {
    expect(formatTimeOfDay(0)).toBe("06:00");
    expect(formatTimeOfDay(sunDayDurationSeconds / sunCycleDurationSeconds)).toBe("18:00");
    expect(formatTimeOfDay(1)).toBe("06:00");
  });
});
