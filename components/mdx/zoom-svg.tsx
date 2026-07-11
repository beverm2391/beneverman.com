"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// Compile-time mermaid diagrams are the only inline <svg> elements MDX emits
// (icon svgs live inside bespoke components, which the MDX element map never
// reaches), so remapping `svg` gives every diagram the same click-to-zoom
// lightbox as images. The .mermaid-figure wrapper centers the diagram and
// owns its block spacing — the typography plugin has no rule for bare svg.
export function ZoomSvg(props: React.ComponentProps<"svg">) {
  return (
    <span className="mermaid-figure">
      <Zoom wrapElement="span" zoomMargin={96}>
        <svg {...props} />
      </Zoom>
    </span>
  );
}
