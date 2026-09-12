"use client";

import { useEffect, useState } from "react";
import { nestToc, type TocItem, type TocNode } from "@/lib/toc";

// One semantic renderer serves every long-form surface. Placement and the
// scroll activation line are policy inputs; the heading outline is always
// rendered as nested lists from the source h2/h3 depths.
export function PostToc({
  items,
  className = "post-toc",
  activationOffset = 112,
  activateFirst = false
}: {
  items: TocItem[];
  className?: string;
  activationOffset?: number;
  activateFirst?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let current: string | null = activateFirst ? (items[0]?.id ?? null) : null;
      for (const { id } of items) {
        const heading = document.getElementById(id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top > activationOffset) break;
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
  }, [activateFirst, activationOffset, items]);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <nav aria-label="Table of contents">
        <TocList nodes={nestToc(items)} active={active} />
      </nav>
    </div>
  );
}

function TocList({ nodes, active }: { nodes: TocNode[]; active: string | null }) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.id}>
          <a
            href={`#${node.id}`}
            aria-current={active === node.id ? "true" : undefined}
            className={
              active === node.id
                ? "text-fg"
                : "text-muted transition-colors duration-150 hover:text-fg"
            }
          >
            {node.text}
          </a>
          {node.children.length > 0 ? (
            <TocList nodes={node.children} active={active} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
