"use client";

import { X } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// Every MDX image renders through this (registered as `img` in the
// mdxComponents map): click animates the image open to a full-screen
// lightbox; Esc, click-away, or scroll animates it back. The same wrapper is
// meant for future rich media (e.g. mermaid SVGs) — anything img/svg-shaped.
export function ZoomImage(props: React.ComponentProps<"img">) {
  return (
    // wrapElement="span": markdown images live inside <p>, and the library's
    // default <div> wrapper is invalid there (browser re-parses, hydration
    // mismatch). zoomMargin keeps the zoomed image comfortably inside the
    // viewport rather than edge-to-edge.
    <Zoom IconUnzoom={X} wrapElement="span" zoomMargin={96}>
      {/* eslint-disable-next-line @next/next/no-img-element -- MDX content
          images have unknown dimensions; next/image needs width/height. */}
      <img loading="lazy" {...props} />
    </Zoom>
  );
}
