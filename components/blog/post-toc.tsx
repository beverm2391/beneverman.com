"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

// Minimal long-form TOC: a sticky rail to the right of the 68ch article
// column that starts level with the article body and pins below the site
// header while reading. It exists only where the margin is wide enough (the
// .post-toc media query in globals.css) — no drawer at narrow widths. Highlight
// tracks reading position: the last heading at or above the ~6rem mark (just
// under the sticky header) is the section being read. A plain rAF-throttled
// scroll listener over a handful of headings is cheap and, unlike an
// IntersectionObserver, has no fast-scroll misses.
export function PostToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const { id } of items) {
        const heading = document.getElementById(id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top > 96) break;
        current = id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label="Table of contents" className="post-toc">
      <ul>
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-3" : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={
                active === item.id
                  ? "text-fg"
                  : "text-muted transition-colors duration-150 hover:text-fg"
              }
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
