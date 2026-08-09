"use client";

import { Maximize2, Minimize2, MoveLeft, MoveRight } from "lucide-react";
import { Geist_Mono, Lora } from "next/font/google";
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
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
  monoFontClassName?: string;
  serifFontClassName?: string;
};

const presentationSerif = Lora({
  subsets: ["latin"],
  variable: "--font-presentation-serif",
  display: "swap"
});

const presentationMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-presentation-mono",
  display: "swap"
});

const controlButtonClass =
  "inline-flex size-9 cursor-pointer items-center justify-center border border-neutral-300 bg-white/90 text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-default disabled:opacity-35 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-300";

const wideControlButtonClass = `${controlButtonClass} w-auto gap-1.5 px-3 text-sm font-medium`;

// A deliberately small authoring surface: a post supplies one PresentationSlide
// per slide, and this component owns only viewing, movement, and fullscreen.
export function Presentation({
  children,
  className = "",
  label = "Presentation",
  monoFontClassName = presentationMono.variable,
  serifFontClassName = presentationSerif.variable
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
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (!rootRef.current || document.fullscreenElement === rootRef.current) return;

    try {
      setFullscreenError(null);
      await rootRef.current.requestFullscreen();
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser. Use the embedded view instead.");
    }
  }, []);

  async function exitFullscreen() {
    try {
      setFullscreenError(null);
      await document.exitFullscreen();
    } catch {
      setFullscreenError("Fullscreen could not be exited. Press Escape to leave it.");
    }
  }

  const move = useCallback((action: PresentationAction) => {
    setActiveIndex((currentIndex) =>
      movePresentationSlide(Math.min(currentIndex, slideCount - 1), slideCount, action)
    );
  }, [slideCount]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // The deck listens at the document level so keyboard navigation never
      // requires moving focus onto the entire presentation. Interactive slide
      // content and modified shortcuts keep their normal keyboard behaviour.
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (event.target instanceof HTMLElement &&
          event.target.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }

      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const isVisible = document.fullscreenElement === root || (rect.bottom > 0 && rect.top < window.innerHeight);
      if (!isVisible) return;

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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enterFullscreen, move]);

  if (slideCount === 0) return null;
  // The deck can be hot-reloaded with fewer slides while its previous state
  // still points past the end. Deriving this avoids a corrective render.
  const currentIndex = Math.min(activeIndex, slideCount - 1);

  return (
    <section
      ref={rootRef}
      aria-label={`${label}: slide ${currentIndex + 1} of ${slideCount}`}
      className={`not-prose relative overflow-hidden bg-[#f5f5f5] text-[#0a0a0a] dark:bg-[#0a0a0a] dark:text-[#f5f5f5] ${serifFontClassName} ${monoFontClassName} ${isFullscreen ? "flex h-full w-full items-center justify-center" : "content-breakout my-10"} ${className}`}
    >
      <div
        aria-live="polite"
        className={`relative overflow-hidden border border-[#d4d4d4] bg-white shadow-[0_1.5px_0_-0.5px_#525252] dark:border-neutral-700 dark:bg-[#171717] dark:shadow-none ${isFullscreen ? "h-[min(100vh,calc(100vw*9/16))] w-[min(100vw,calc(100vh*16/9))]" : "aspect-video"}`}
      >
        <div className="h-full w-full">{slides[currentIndex]}</div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[clamp(1.5rem,7vw,9rem)] top-[clamp(1.25rem,3.5vw,3rem)] flex items-center gap-3 border-b border-neutral-300 pb-2 font-[var(--font-presentation-mono)] text-[clamp(0.55rem,0.8vw,0.7rem)] tracking-[0.09em] text-neutral-500 uppercase dark:border-neutral-700 dark:text-neutral-400"
        >
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <span>{String(currentIndex + 1).padStart(2, "0")}</span>
        </div>

        <div className="absolute right-3 bottom-3 flex items-center gap-2 font-[var(--font-presentation-mono)] text-sm">
          <span className="border border-neutral-300 bg-white/90 px-2 py-1 text-xs text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-400">
            {String(currentIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
          </span>
          <button
            aria-label="Previous slide"
            className={controlButtonClass}
            disabled={currentIndex === 0}
            onClick={() => move("previous")}
            type="button"
          >
            <MoveLeft aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Next slide"
            className={controlButtonClass}
            disabled={currentIndex === slideCount - 1}
            onClick={() => move("next")}
            type="button"
          >
            <MoveRight aria-hidden="true" size={18} />
          </button>
          {isFullscreen ? (
            <button
              aria-label="Exit fullscreen"
              className={wideControlButtonClass}
              onClick={() => void exitFullscreen()}
              type="button"
            >
              <Minimize2 aria-hidden="true" size={16} />
              Exit
            </button>
          ) : (
            <button
              aria-label="Enter fullscreen"
              className={controlButtonClass}
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
    <div className="flex h-full w-full items-center px-[clamp(1.5rem,7vw,9rem)] pt-[clamp(3.75rem,8vw,7rem)] pb-[clamp(4rem,8vw,7rem)] font-[var(--font-presentation-serif)] [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4 [&_blockquote]:border-l [&_blockquote]:border-neutral-300 [&_blockquote]:pl-[clamp(1rem,2.5vw,2rem)] [&_blockquote]:text-neutral-600 dark:[&_blockquote]:border-neutral-700 dark:[&_blockquote]:text-neutral-300 [&_h1]:max-w-[19ch] [&_h1]:text-[clamp(1.7rem,4.5vw,4rem)] [&_h1]:leading-[1.08] [&_h1]:font-medium [&_h1]:tracking-[-0.025em] [&_h2]:max-w-[24ch] [&_h2]:text-[clamp(1.4rem,3.3vw,3rem)] [&_h2]:leading-[1.12] [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_li]:mt-[0.45em] [&_ol]:mt-[1em] [&_ol]:list-decimal [&_ol]:pl-[1.4em] [&_p]:mt-[1em] [&_p]:max-w-[54ch] [&_p]:text-[clamp(0.8rem,1.4vw,1.15rem)] [&_p]:leading-[1.55] [&_p]:text-neutral-700 dark:[&_p]:text-neutral-300 [&_strong]:font-semibold [&_ul]:mt-[1em] [&_ul]:list-disc [&_ul]:pl-[1.25em]">
      <div className="w-full">{children}</div>
    </div>
  );
}
