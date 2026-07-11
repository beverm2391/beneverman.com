"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// Compile-time mermaid diagrams are the only inline <svg> elements MDX emits
// (icon svgs live inside bespoke components, which the MDX element map never
// reaches), so remapping `svg` gives every diagram the same click-to-zoom
// lightbox as images. The wrapper is a card in the code-block language
// (code-bg fill, hairline border, house radius) with the diagram centered;
// the [&_…] variants blockify the zoom library's inline span wrappers so the
// svg — width 100%, capped by its inline natural max-width — centers on auto
// margins. The zoomed clone's max-width lift lives in globals.css because the
// modal portals outside this tree.
export function ZoomSvg(props: React.ComponentProps<"svg">) {
  return (
    <span className="mermaid-figure my-8 block rounded-[var(--radius)] border border-border bg-code-bg px-4 py-5 [&_[data-rmiz-content]]:block [&_[data-rmiz]]:block [&_svg]:mx-auto [&_svg]:block">
      <Zoom wrapElement="span" zoomMargin={96}>
        <svg {...props} />
      </Zoom>
    </span>
  );
}
