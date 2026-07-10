"use client";

// Live tweaker for the paper grain overlay. Hidden unless the URL carries
// `?debug`; writes straight to the `--grain-*` CSS variables on <html> so
// changes are instant. Only the grain is tunable — the gradient wash is fixed.
// Dev/authoring aid, not part of the reading experience. "Copy CSS" dumps the
// current values to paste back into globals.css once a look is settled.
import { useEffect, useState } from "react";

type Kind = "color" | "range" | "select";

type Control = {
  cssVar: string;
  label: string;
  kind: Kind;
  default: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
};

const CONTROLS: Control[] = [
  { cssVar: "--grain-opacity", label: "grain opacity", kind: "range", default: "0.19", min: 0, max: 0.4, step: 0.01 },
  { cssVar: "--grain-scale", label: "grain scale", kind: "range", default: "180", min: 60, max: 400, step: 10, unit: "px" },
  {
    cssVar: "--grain-blend",
    label: "grain blend",
    kind: "select",
    default: "multiply",
    options: ["multiply", "normal", "overlay", "screen", "soft-light"]
  }
];

function withUnit(control: Control, raw: string) {
  return control.unit ? `${raw}${control.unit}` : raw;
}

export function PaperDebug() {
  const [enabled, setEnabled] = useState(false);
  const [grainOn, setGrainOn] = useState(true);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(CONTROLS.map((control) => [control.cssVar, control.default]))
  );

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  // Push every value to the document as a CSS var whenever it changes.
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    for (const control of CONTROLS) {
      root.style.setProperty(control.cssVar, withUnit(control, values[control.cssVar]));
    }
  }, [enabled, values]);

  // Toggle the grain layer off via a class so slider values are preserved
  // across on/off — lets Ben A/B the overlay against the bare gradient.
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.toggle("grain-off", !grainOn);
    return () => document.documentElement.classList.remove("grain-off");
  }, [enabled, grainOn]);

  if (!enabled) return null;

  const set = (cssVar: string, raw: string) =>
    setValues((prev) => ({ ...prev, [cssVar]: raw }));

  const copyCss = () => {
    const lines = CONTROLS.map((c) => `  ${c.cssVar}: ${withUnit(c, values[c.cssVar])};`);
    void navigator.clipboard.writeText(lines.join("\n"));
  };

  const reset = () =>
    setValues(Object.fromEntries(CONTROLS.map((c) => [c.cssVar, c.default])));

  return (
    <aside className="paper-debug" aria-label="Paper background debug">
      <div className="paper-debug-head">
        <span className="paper-debug-title">grain overlay</span>
        <button
          type="button"
          className="paper-debug-toggle"
          aria-pressed={grainOn}
          onClick={() => setGrainOn((on) => !on)}
        >
          {grainOn ? "on" : "off"}
        </button>
      </div>
      {CONTROLS.map((control) => (
        <label key={control.cssVar} className="paper-debug-row">
          <span className="paper-debug-label">{control.label}</span>
          {control.kind === "select" ? (
            <select
              value={values[control.cssVar]}
              onChange={(event) => set(control.cssVar, event.currentTarget.value)}
            >
              {control.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : control.kind === "color" ? (
            <input
              type="color"
              value={values[control.cssVar]}
              onChange={(event) => set(control.cssVar, event.currentTarget.value)}
            />
          ) : (
            <span className="paper-debug-range">
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={values[control.cssVar]}
                onChange={(event) => set(control.cssVar, event.currentTarget.value)}
              />
              <span className="paper-debug-value">{withUnit(control, values[control.cssVar])}</span>
            </span>
          )}
        </label>
      ))}
      <div className="paper-debug-actions">
        <button type="button" onClick={copyCss}>
          copy CSS
        </button>
        <button type="button" onClick={reset}>
          reset
        </button>
      </div>
    </aside>
  );
}
