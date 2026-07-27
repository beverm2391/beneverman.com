"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

// The blog and research surfaces share scroll tracking but deliberately place
// the rail differently. Blog puts it beside the reading column; research
// mirrors the BENCORP paper layout with a left rail anchored to the route.
// A rAF-throttled scroll listener over a handful of headings is cheap and,
// unlike an IntersectionObserver, has no fast-scroll misses.
export function PostToc({
  items,
  variant = "post"
}: {
  items: TocItem[];
  variant?: "post" | "research";
}) {
  const [active, setActive] = useState<string | null>(null);
  const isResearch = variant === "research";

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      // BENCORP's paper TOC treats the first section as active while the
      // reader is still in the title block; the normal blog waits until a
      // heading reaches its tighter activation line.
      let current: string | null = isResearch ? (items[0]?.id ?? null) : null;
      for (const { id } of items) {
        const heading = document.getElementById(id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top > (isResearch ? 150 : 112)) break;
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
  }, [isResearch, items]);

  if (items.length === 0) return null;

  return (
    <div className={isResearch ? "research-toc" : "post-toc"}>
      <nav aria-label="Table of contents">
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className={!isResearch && item.depth === 3 ? "pl-3" : undefined}
            >
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
    </div>
  );
}
