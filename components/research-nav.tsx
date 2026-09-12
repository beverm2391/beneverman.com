"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Faithful counterpart to BENCORP web's BlogNav. The sentinel creates the
// generous paper-site opening; once it leaves the viewport, the breadcrumb
// gains the same quiet divider shadow as the source layout.
export function ResearchNav({ title }: { title?: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-4 sm:h-18" />
      <nav
        className={`sticky top-0 z-10 mx-auto max-w-[1020px] bg-neutral-100/90 backdrop-blur-sm transition-shadow duration-300 dark:bg-neutral-950/90 ${
          isStuck
            ? "shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]"
            : "shadow-none"
        }`}
      >
        <div className="mx-auto max-w-[960px] px-8 py-3">
          <div className="flex items-center gap-2 font-[family-name:var(--font-research-mono)] text-xs tracking-wide text-muted uppercase">
            <Link href="/" className="transition-colors hover:text-fg">
              Home
            </Link>
            <span className="text-muted/40">/</span>
            <Link href="/research" className="transition-colors hover:text-fg">
              Research
            </Link>
            {title ? (
              <>
                <span className="text-muted/40">/</span>
                <span className="truncate text-muted">{title}</span>
              </>
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
}
