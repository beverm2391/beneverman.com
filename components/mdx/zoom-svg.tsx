"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// Compile-time mermaid diagrams are the only inline <svg> elements MDX emits
// (icon svgs live inside bespoke components, which the MDX element map never
// reaches), so remapping `svg` gives every diagram the same click-to-zoom
// lightbox as images. The card styling (surface fill, hairline border, house
// radius, padding) sits on the svg itself — the zoom library deep-clones the
// clicked element into its modal, so the card travels with the zoom: click
// lifts the card and scales it up. Mermaid's inline max-width is its natural
// drawing width; the calc grows it by the card's padding + border so the
// diagram still renders at natural size inside the border-box.
export function ZoomSvg({ className, style, ...props }: React.ComponentProps<"svg">) {
  return (
    <span className="mermaid-figure my-8 block [&_[data-rmiz-content]]:block [&_[data-rmiz]]:block">
      <Zoom wrapElement="span" zoomMargin={48}>
        <svg
          {...props}
          className={`${className ?? ""} mx-auto block rounded-[var(--radius)] border border-border bg-surface p-4`}
          style={{
            ...style,
            maxWidth: style?.maxWidth
              ? `calc(${style.maxWidth} + 2rem + 2px)`
              : undefined
          }}
        />
      </Zoom>
    </span>
  );
}
