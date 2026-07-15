import path from "node:path";
import { pathToFileURL } from "node:url";

// Mermaid measures text with getBBox() in a real browser, so the render page
// must resolve the same Geist the reader gets or every node is sized for the
// wrong font. Passing this to rehype-mermaid's `css` option is what makes the
// layout honest; `fontFamily` below names the family the stylesheet defines.
export const mermaidFontCSS = pathToFileURL(
  path.join(process.cwd(), "lib/mermaid-geist.css")
);

export const mermaidFontFamily = "Geist, ui-sans-serif, sans-serif";

// Mermaid paints entirely through CSS — its generated stylesheet carries every
// colour and it emits no inline fill/stroke attributes — so handing it the
// site's tokens produces one compiled SVG that reads correctly in both themes.
// That is why `theme: "base"` matters: it is the only mermaid theme that does
// not bake opinionated colours which resist overrides.
//
// The alternative, themeVariables, cannot work: mermaid runs colour maths
// (lighten/darken) over those values, which var() breaks.
//
// Selectors below mirror mermaid 11's generated rules. Anything it paints that
// is not listed here stays the base theme's cream, which is the tell that a
// selector is missing.
export const mermaidThemeCSS = `
  /* Text: labels, node text, titles. */
  .label, .nodeLabel, .cluster-label, span, p { color: var(--fg); }
  text, tspan, .label text, .flowchartTitleText, .titleText { fill: var(--fg); }

  /* Node shells share the card's material. */
  .node rect, .node circle, .node ellipse, .node polygon, .node path,
  .basic.label-container, .rect_left_inv_arrow {
    fill: var(--surface);
    stroke: var(--border);
  }

  /* Connectors and arrowheads read as secondary. */
  .marker, .marker.cross, .arrowheadPath, marker path {
    fill: var(--muted);
    stroke: var(--muted);
  }
  .edgePath .path, .flowchart-link, .relation, .transition,
  .messageLine0, .messageLine1, .actor-line, .relationshipLine {
    stroke: var(--muted);
  }

  /* Edge labels sit on the card, not on the base theme's tint. */
  .edgeLabel, .edgeLabel p { color: var(--muted); background-color: var(--surface); }
  .edgeLabel rect, .labelBkg, .label-container { fill: var(--surface); background-color: var(--surface); }

  /* Subgraphs / groups recede behind their nodes. */
  .cluster rect, .cluster-rect { fill: var(--bg); stroke: var(--border); }
  .cluster text, .cluster span { fill: var(--fg); color: var(--fg); }

  /* Sequence, class, state and ER reuse the same materials. */
  .actor, .classGroup rect, .entityBox, .stateGroup rect, .node .state-start {
    fill: var(--surface);
    stroke: var(--border);
  }
  .actor text, .classGroup text, .entityLabel, .messageText, .loopText, .noteText {
    fill: var(--fg);
  }
  .note, .noteGroup rect, .labelBox { fill: var(--bg); stroke: var(--border); }
  .loopLine { stroke: var(--border); }
`;
