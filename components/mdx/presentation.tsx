"use client";

import { Maximize2, Minimize2, MoveLeft, MoveRight } from "lucide-react";
import {
  Children,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from "react";
import {
  getPresentationAction,
  movePresentationSlide,
  type PresentationAction
} from "@/components/mdx/presentation-navigation";

type PresentationProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

// A deliberately small authoring surface: a post supplies one PresentationSlide
// per slide, and this component owns only viewing, movement, and fullscreen.
export function Presentation({
  children,
  className = "",
  label = "Presentation"
}: PresentationProps) {
  const slides = Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const slideCount = slides.length;

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === rootRef.current;
      setIsFullscreen(fullscreen);
      if (fullscreen) rootRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function enterFullscreen() {
    if (!rootRef.current || document.fullscreenElement === rootRef.current) return;

    try {
      setFullscreenError(null);
      await rootRef.current.requestFullscreen();
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser. Use the embedded view instead.");
    }
  }

  async function exitFullscreen() {
    try {
      setFullscreenError(null);
      await document.exitFullscreen();
    } catch {
      setFullscreenError("Fullscreen could not be exited. Press Escape to leave it.");
    }
  }

  const move = (action: PresentationAction) => {
    setActiveIndex((currentIndex) =>
      movePresentationSlide(Math.min(currentIndex, slideCount - 1), slideCount, action)
    );
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    // Slides can contain interactive examples later; their text editing must
    // not unexpectedly become deck navigation.
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }

    const action = getPresentationAction(event.key);
    if (action) {
      event.preventDefault();
      move(action);
      return;
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      void enterFullscreen();
    }
  };

  if (slideCount === 0) return null;
  // The deck can be hot-reloaded with fewer slides while its previous state
  // still points past the end. Deriving this avoids a corrective render.
  const currentIndex = Math.min(activeIndex, slideCount - 1);

  return (
    <section
      ref={rootRef}
      aria-label={`${label}: slide ${currentIndex + 1} of ${slideCount}`}
      className={`not-prose relative overflow-hidden bg-bg text-fg ${isFullscreen ? "flex h-full w-full items-center justify-center" : "my-8"} ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        aria-live="polite"
        className={`relative overflow-hidden border border-border bg-surface ${isFullscreen ? "h-[min(100vh,calc(100vw*9/16))] w-[min(100vw,calc(100vh*16/9))]" : "aspect-video rounded-[var(--radius)]"}`}
      >
        <div className="h-full w-full">{slides[currentIndex]}</div>

        <div className="absolute right-3 bottom-3 flex items-center gap-2 text-sm">
          <span className="rounded-md bg-bg/90 px-2 py-1 font-mono text-xs text-muted shadow-sm">
            {currentIndex + 1} / {slideCount}
          </span>
          <button
            aria-label="Previous slide"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border bg-bg/90 text-fg shadow-sm transition-colors hover:bg-code-bg disabled:cursor-default disabled:opacity-40"
            disabled={currentIndex === 0}
            onClick={() => move("previous")}
            type="button"
          >
            <MoveLeft aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Next slide"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border bg-bg/90 text-fg shadow-sm transition-colors hover:bg-code-bg disabled:cursor-default disabled:opacity-40"
            disabled={currentIndex === slideCount - 1}
            onClick={() => move("next")}
            type="button"
          >
            <MoveRight aria-hidden="true" size={18} />
          </button>
          {isFullscreen ? (
            <button
              aria-label="Exit fullscreen"
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-bg/90 px-3 text-sm font-medium text-fg shadow-sm transition-colors hover:bg-code-bg"
              onClick={() => void exitFullscreen()}
              type="button"
            >
              <Minimize2 aria-hidden="true" size={16} />
              Exit
            </button>
          ) : (
            <button
              aria-label="Enter fullscreen"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border bg-bg/90 text-fg shadow-sm transition-colors hover:bg-code-bg"
              onClick={() => void enterFullscreen()}
              type="button"
            >
              <Maximize2 aria-hidden="true" size={18} />
            </button>
          )}
        </div>
      </div>
      <p className="sr-only">Use left and right arrow keys, Page Up, Page Down, Home, or End to move through slides. Press F for fullscreen.</p>
      {fullscreenError ? <p className="sr-only" role="status">{fullscreenError}</p> : null}
    </section>
  );
}

export function PresentationSlide({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full items-center px-[clamp(1.5rem,7vw,9rem)] py-[clamp(3rem,8vh,7rem)]">
      <div className="w-full">{children}</div>
    </div>
  );
}
