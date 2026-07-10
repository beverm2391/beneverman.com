"use client";

// Live tweaker for the paper grain overlay. Hidden unless the URL carries
// `?debug`; writes straight to the `--grain-*` CSS variables on <html> so
// changes are instant. Only the grain is tunable — the gradient wash is fixed.
// Dev/authoring aid, not part of the reading experience. Styled to match the
// scene lab (dark floating panel) and draggable by its header. "Copy CSS" dumps
// the current values to paste back into globals.css once a look is settled.
import { useCallback, useEffect, useRef, useState } from "react";

type Kind = "range" | "select";

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

const PANEL_WIDTH = 232;

function withUnit(control: Control, raw: string) {
  return control.unit ? `${raw}${control.unit}` : raw;
}

export function PaperDebug() {
  const [enabled, setEnabled] = useState(false);
  const [grainOn, setGrainOn] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(CONTROLS.map((control) => [control.cssVar, control.default]))
  );

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).has("debug"));
    // Park top-right on first mount; dragging takes over from there.
    setPos({ x: window.innerWidth - PANEL_WIDTH - 16, y: 16 });
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

  // Drag by the header. Pointer offset is captured on down; move/up listen on
  // the window so the drag survives fast pointer movement outside the panel.
  const onHeaderPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!pos) return;
      dragOffset.current = { dx: event.clientX - pos.x, dy: event.clientY - pos.y };
      const onMove = (move: PointerEvent) => {
        if (!dragOffset.current) return;
        const maxX = window.innerWidth - PANEL_WIDTH;
        const nextX = Math.min(Math.max(0, move.clientX - dragOffset.current.dx), maxX);
        const nextY = Math.max(0, Math.min(move.clientY - dragOffset.current.dy, window.innerHeight - 40));
        setPos({ x: nextX, y: nextY });
      };
      const onUp = () => {
        dragOffset.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [pos]
  );

  if (!enabled || !pos) return null;

  const set = (cssVar: string, raw: string) =>
    setValues((prev) => ({ ...prev, [cssVar]: raw }));

  const copyCss = () => {
    const lines = CONTROLS.map((c) => `  ${c.cssVar}: ${withUnit(c, values[c.cssVar])};`);
    void navigator.clipboard.writeText(lines.join("\n"));
  };

  const reset = () =>
    setValues(Object.fromEntries(CONTROLS.map((c) => [c.cssVar, c.default])));

  return (
    <aside
      aria-label="Paper background debug"
      style={{ left: pos.x, top: pos.y, width: PANEL_WIDTH }}
      className="fixed z-50 select-none overflow-hidden rounded-xl border border-white/10 bg-neutral-900/95 font-mono text-[0.7rem] text-neutral-200 shadow-2xl backdrop-blur-md"
    >
      <div
        onPointerDown={onHeaderPointerDown}
        className="flex cursor-grab items-center justify-between gap-2 border-b border-white/10 px-3 py-2 active:cursor-grabbing"
      >
        <span className="flex items-center gap-1.5 uppercase tracking-[0.08em] text-neutral-400">
          <span aria-hidden className="text-neutral-600">⠿</span>
          grain overlay
        </span>
        <button
          type="button"
          aria-pressed={grainOn}
          onClick={() => setGrainOn((on) => !on)}
          className={`rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.06em] transition-colors ${
            grainOn ? "bg-white text-neutral-900" : "bg-white/10 text-neutral-300 hover:bg-white/20"
          }`}
        >
          {grainOn ? "on" : "off"}
        </button>
      </div>

      <div className="grid gap-3 p-3">
        {CONTROLS.map((control) => (
          <label key={control.cssVar} className="grid grid-cols-[1fr_auto] items-center gap-2">
            <span className="text-neutral-400">{control.label}</span>
            {control.kind === "select" ? (
              <select
                value={values[control.cssVar]}
                onChange={(event) => set(control.cssVar, event.currentTarget.value)}
                className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-neutral-200 outline-none focus:border-white/25"
              >
                {control.options?.map((option) => (
                  <option key={option} value={option} className="bg-neutral-900">
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <span className="inline-flex items-center gap-2">
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={values[control.cssVar]}
                  onChange={(event) => set(control.cssVar, event.currentTarget.value)}
                  className="h-1 w-24 cursor-pointer accent-blue-500"
                />
                <span className="min-w-[2.6rem] text-right tabular-nums text-neutral-300">
                  {withUnit(control, values[control.cssVar])}
                </span>
              </span>
            )}
          </label>
        ))}

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={copyCss}
            className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-neutral-200 hover:bg-white/10"
          >
            copy CSS
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-neutral-200 hover:bg-white/10"
          >
            reset
          </button>
        </div>
      </div>
    </aside>
  );
}
