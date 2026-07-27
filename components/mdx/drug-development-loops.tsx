"use client";

import { useState, useSyncExternalStore } from "react";

type Layer = "all" | "assay" | "domain" | "trial";

type NodeSpec = {
  x: number;
  y: number;
  lines: string[];
  width?: number;
};

type ArrowSpec = {
  x: number;
  y: number;
  rotation: number;
  size?: number;
};

type LoopSpec = {
  id: Exclude<Layer, "all">;
  name: string;
  color: string;
  labelY: number;
  paths: string[];
  arrows: ArrowSpec[];
  nodes: NodeSpec[];
};

const layerDetails: Record<Layer, string> = {
  all: "Each outer loop uses the inner loop to reach more expensive evidence, then returns that evidence to the same learning core.",
  assay: "Structure → predict assay outputs → verify with real assays → retrain.",
  domain:
    "Structure inputs → assay predictions → in vivo laboratory tests → retrain the domain model.",
  trial:
    "In vivo predictions → select a trial drug → run the trial → retrain on trial evidence.",
};

const tabs: Array<{ id: Layer; label: string }> = [
  { id: "all", label: "Whole system" },
  { id: "assay", label: "Assay engine" },
  { id: "domain", label: "Domain engine" },
  { id: "trial", label: "Trial engine" },
];

const viewBoxes: Record<Layer, string> = {
  all: "0 0 720 630",
  assay: "210 160 300 300",
  domain: "145 95 430 430",
  trial: "25 0 670 620",
};

const mobileQuery = "(max-width: 639px)";

function subscribeToMobileQuery(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(mobileQuery);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(mobileQuery).matches;
}

function getServerMobileSnapshot() {
  return false;
}

const loops: LoopSpec[] = [
  {
    id: "trial",
    name: "TRIAL ENGINE",
    color: "var(--info)",
    labelY: 18,
    paths: [
      "M360 55 A255 255 0 0 1 615 310",
      "M615 310 A255 255 0 0 1 360 565",
      "M360 565 A255 255 0 0 1 105 310",
      "M105 310 A255 255 0 0 1 360 55",
    ],
    arrows: [
      { x: 540, y: 130, rotation: 45 },
      { x: 540, y: 490, rotation: 135 },
      { x: 180, y: 490, rotation: 225 },
      { x: 180, y: 130, rotation: 315 },
    ],
    nodes: [
      { x: 360, y: 55, lines: ["In vivo", "predictions"], width: 132 },
      { x: 615, y: 310, lines: ["Select", "trial drug"], width: 132 },
      { x: 360, y: 565, lines: ["Run trial"] },
      { x: 105, y: 310, lines: ["Retrain"], width: 104 },
    ],
  },
  {
    id: "domain",
    name: "DOMAIN ENGINE",
    color: "var(--success)",
    labelY: 125,
    paths: [
      "M360 145 A165 165 0 0 1 525 310",
      "M525 310 A165 165 0 0 1 360 475",
      "M360 475 A165 165 0 0 1 195 310",
      "M195 310 A165 165 0 0 1 360 145",
    ],
    arrows: [
      { x: 360, y: 145, rotation: 0 },
      { x: 525, y: 310, rotation: 90 },
      { x: 360, y: 475, rotation: 180 },
      { x: 195, y: 310, rotation: 270 },
    ],
    nodes: [
      { x: 243, y: 193, lines: ["Structure", "inputs"], width: 114 },
      { x: 477, y: 193, lines: ["Assay", "predictions"], width: 120 },
      { x: 477, y: 427, lines: ["In vivo", "lab tests"], width: 120 },
      { x: 243, y: 427, lines: ["Retrain"], width: 104 },
    ],
  },
  {
    id: "assay",
    name: "ASSAY ENGINE",
    color: "var(--warning)",
    labelY: 185,
    paths: [
      "M360 220 A90 90 0 0 1 450 310",
      "M450 310 A90 90 0 0 1 360 400",
      "M360 400 A90 90 0 0 1 270 310",
      "M270 310 A90 90 0 0 1 360 220",
    ],
    arrows: [
      { x: 424, y: 246, rotation: 45, size: 6 },
      { x: 424, y: 374, rotation: 135, size: 6 },
      { x: 296, y: 374, rotation: 225, size: 6 },
      { x: 296, y: 246, rotation: 315, size: 6 },
    ],
    nodes: [
      { x: 360, y: 220, lines: ["Structure"], width: 104 },
      { x: 450, y: 310, lines: ["Predict"], width: 96 },
      { x: 360, y: 400, lines: ["Verify"], width: 96 },
      { x: 270, y: 310, lines: ["Retrain"], width: 96 },
    ],
  },
];

function LoopNode({
  node,
  color,
}: {
  node: NodeSpec;
  color: string;
}) {
  const width = node.width ?? 112;
  const height = node.lines.length === 1 ? 38 : 56;

  return (
    <g transform={`translate(${node.x} ${node.y})`}>
      <rect
        x={width / -2}
        y={height / -2}
        width={width}
        height={height}
        rx={19}
        fill={`color-mix(in oklab, ${color} 14%, var(--bg))`}
        stroke={color}
        strokeWidth={1.5}
      />
      <text
        textAnchor="middle"
        fill="var(--fg)"
        fontSize={13}
        fontWeight={500}
      >
        {node.lines.map((line, index) => (
          <tspan
            key={line}
            x={0}
            y={node.lines.length === 1 ? 5 : index === 0 ? -2 : 16}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function LoopLayer({
  loop,
  opacity,
}: {
  loop: LoopSpec;
  opacity: number;
}) {
  return (
    <g className="transition-opacity duration-200" style={{ opacity }}>
      <text
        x={360}
        y={loop.labelY}
        textAnchor="middle"
        fill="var(--fg)"
        fontSize={12}
        fontWeight={500}
        letterSpacing="0.08em"
      >
        {loop.name}
      </text>
      {loop.paths.map((path) => (
        <path
          key={path}
          d={path}
          fill="none"
          stroke={loop.color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
      {loop.arrows.map(({ x, y, rotation, size = 7 }) => (
        <path
          key={`${x}-${y}`}
          d={`M${-size} ${-size + 2} L${size} 0 L${-size} ${size - 2}z`}
          transform={`translate(${x} ${y}) rotate(${rotation})`}
          fill={loop.color}
          aria-hidden="true"
        />
      ))}
      {loop.nodes.map((node) => (
        <LoopNode
          key={`${loop.id}-${node.x}-${node.y}`}
          node={node}
          color={loop.color}
        />
      ))}
    </g>
  );
}

function SharedCore() {
  return (
    <g>
      <circle
        cx={360}
        cy={310}
        r={49}
        fill="var(--fg)"
        stroke="var(--border)"
        strokeWidth={2}
      />
      <text
        x={360}
        y={298}
        textAnchor="middle"
        fill="var(--bg)"
      >
        <tspan x={360} fontSize={10} fontWeight={500} letterSpacing="0.07em">
          SHARED CORE
        </tspan>
        <tspan x={360} y={320} fontSize={12} fontWeight={500}>
          predict · select
        </tspan>
        <tspan x={360} y={340} fontSize={12} fontWeight={500}>
          learn
        </tspan>
      </text>
    </g>
  );
}

function DirectionKey() {
  return (
    <g aria-hidden="true">
      <path d="M80 607 L150 607" fill="none" stroke="var(--fg)" />
      <path d="M150 607 L139 601 L139 613z" fill="var(--fg)" />
      <text x={160} y={612} fill="var(--muted)" fontSize={11}>
        capability expands
      </text>
      <path d="M640 607 L570 607" fill="none" stroke="var(--fg)" />
      <path d="M570 607 L581 601 L581 613z" fill="var(--fg)" />
      <text
        x={560}
        y={612}
        textAnchor="end"
        fill="var(--muted)"
        fontSize={11}
      >
        evidence returns
      </text>
    </g>
  );
}

export function DrugDevelopmentLoops() {
  const [selectedFocus, setSelectedFocus] = useState<Layer>("all");
  const [hasInteracted, setHasInteracted] = useState(false);
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getServerMobileSnapshot
  );
  const focus = isMobile && !hasInteracted ? "assay" : selectedFocus;

  return (
    <figure className="not-prose my-12 w-full">
      <div
        className="mb-3 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Focus a drug-development learning loop"
      >
        {tabs.map((tab) => {
          const selected = focus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setSelectedFocus(tab.id);
                setHasInteracted(true);
              }}
              className={[
                "rounded-md border px-3 py-1.5 text-sm transition-colors",
                selected
                  ? "border-fg bg-fg text-bg"
                  : "border-border bg-bg text-fg hover:bg-surface",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <svg
        viewBox={viewBoxes[focus]}
        className="h-auto w-full"
        role="img"
        aria-labelledby="drug-loops-title drug-loops-description"
      >
        <title id="drug-loops-title">
          Nested assay, domain, and trial learning engines
        </title>
        <desc id="drug-loops-description">
          An assay-prediction loop is nested inside a biological-domain loop,
          which is nested inside a trial loop. Every layer retrains a shared
          modeling core with higher-fidelity evidence.
        </desc>
        {loops.map((loop) => (
          <LoopLayer
            key={loop.id}
            loop={loop}
            opacity={focus === "all" || focus === loop.id ? 1 : 0.12}
          />
        ))}
        <SharedCore />
        <DirectionKey />
      </svg>

      <figcaption className="min-h-6 text-center text-sm text-muted">
        {layerDetails[focus]}
      </figcaption>
    </figure>
  );
}
