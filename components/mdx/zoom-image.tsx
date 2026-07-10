"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// Every MDX image renders through this (registered as `img` in the
// mdxComponents map): click animates the image open to a full-screen
// lightbox; Esc, click-away, or scroll animates it back. The unzoom button is
// hidden via CSS — click/Esc are the close affordances. The same wrapper is
// meant for future rich media (e.g. mermaid SVGs) — anything img/svg-shaped.
//
// The markdown title slot — ![alt](/path "Caption") — renders as a muted
// caption under the image; omit it for no caption.
export function ZoomImage({ title, ...props }: React.ComponentProps<"img">) {
  return (
    <>
      {/* wrapElement="span": markdown images live inside <p>, and the
          library's default <div> wrapper is invalid there (browser re-parses,
          hydration mismatch). zoomMargin keeps the zoomed image comfortably
          inside the viewport rather than edge-to-edge. */}
      <Zoom wrapElement="span" zoomMargin={96}>
        {/* eslint-disable-next-line @next/next/no-img-element -- MDX content
            images have unknown dimensions; next/image needs width/height. */}
        <img loading="lazy" {...props} />
      </Zoom>
      {title ? (
        <span className="mt-1 block text-[0.8rem] leading-snug text-muted">
          {title}
        </span>
      ) : null}
    </>
  );
}
