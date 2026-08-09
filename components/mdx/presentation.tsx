"use client";

import { MoveLeft, MoveRight } from "lucide-react";
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
import {
  blueprintTheme,
  presentationThemeStyle,
  type PresentationTheme
} from "@/components/mdx/presentation-theme";

type PresentationProps = {
  children: ReactNode;
  className?: string;
  label?: string;
  monoFontClassName?: string;
  serifFontClassName?: string;
  theme?: PresentationTheme;
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

// Controls are typographic, not web-app furniture: quiet mono text on the
// bottom hairline rule, mirroring the deck's top rule. No borders, fills, or
// shadows — hover simply raises the ink from muted to foreground.
const controlButtonClass =
  "inline-flex cursor-pointer items-center gap-1.5 py-0.5 text-(--pres-ink-muted) uppercase transition-colors hover:text-(--pres-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--pres-ink-muted) disabled:cursor-default disabled:opacity-30 disabled:hover:text-(--pres-ink-muted)";

// How long the mouse must sit still in fullscreen before the controls and
// cursor fade. Keyboard navigation deliberately does not wake them.
const FULLSCREEN_IDLE_MS = 2500;

// A deliberately small authoring surface: a post supplies one PresentationSlide
// per slide, and this component owns only viewing, movement, and fullscreen.
export function Presentation({
  children,
  className = "",
  label = "Presentation",
  monoFontClassName = presentationMono.variable,
  serifFontClassName = presentationSerif.variable,
  theme = blueprintTheme
}: PresentationProps) {
  const slides = Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  // Two expansion modes: theater fills the browser viewport (the default way
  // to present), fullscreen takes the whole display via the Fullscreen API
  // (reached with ⌘-click or the F key).
  const [isTheater, setIsTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const slideCount = slides.length;
  const isExpanded = isFullscreen || isTheater;

  // While presenting, controls should vanish unless the presenter reaches for
  // the mouse. Embedded view never hides them; the fullscreenchange handler
  // resets idleness on both enter and exit.
  useEffect(() => {
    if (!isExpanded) return;

    let idleTimer = window.setTimeout(() => setIsIdle(true), FULLSCREEN_IDLE_MS);
    const wake = () => {
      setIsIdle(false);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setIsIdle(true), FULLSCREEN_IDLE_MS);
    };

    document.addEventListener("mousemove", wake);
    return () => {
      window.clearTimeout(idleTimer);
      document.removeEventListener("mousemove", wake);
    };
  }, [isExpanded]);

  const controlsHidden = isExpanded && isIdle;

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === rootRef.current;
      setIsFullscreen(fullscreen);
      // Leaving display fullscreen returns all the way to the embedded view;
      // theater is not silently restored underneath it.
      if (!fullscreen) setIsTheater(false);
      setIsIdle(false);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Theater covers the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!isTheater) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isTheater]);

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

      if (event.key === "Escape" && !document.fullscreenElement) {
        setIsTheater(false);
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
      className={`not-prose text-(--pres-ink) ${serifFontClassName} ${monoFontClassName} ${isFullscreen ? "relative h-full w-full overflow-hidden" : isTheater ? "fixed inset-0 z-50" : "content-breakout relative my-10"} ${controlsHidden ? "cursor-none" : ""} ${className}`}
      style={presentationThemeStyle(theme)}
    >
      {/* @container makes the card the reference for every cqw size inside:
          type and spacing are proportions of the slide itself, so the deck
          renders identically on a laptop, a TV, and the embedded card. */}
      <div
        aria-live="polite"
        className={`@container relative overflow-hidden bg-(--pres-paper) ${isExpanded ? "h-full w-full" : "aspect-video rounded-2xl border border-(--pres-rule) shadow-xs/5"}`}
      >
        {/* The embedded deck is a preview; clicking the slide surface presents
            it in the browser viewport, ⌘-click on the whole display. Links and
            controls inside a slide keep their own click behaviour. */}
        <div
          className={`h-full w-full ${isExpanded ? "" : "cursor-zoom-in"}`}
          onClick={(event) => {
            if (isExpanded) return;
            if (
              event.target instanceof HTMLElement &&
              event.target.closest("a, button, input, textarea, select, [contenteditable='true']")
            ) {
              return;
            }
            if (event.metaKey || event.ctrlKey) {
              void enterFullscreen();
            } else {
              setIsTheater(true);
            }
          }}
        >
          {slides[currentIndex]}
        </div>

        {/* Chrome is bare mono corner marks — no rules, no bars. Label
            top-left, presenting controls bottom-left, counter bottom-right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-[max(0.85rem,1.5cqw)] pt-[max(0.75rem,1.3cqw)] font-(family-name:--font-presentation-mono) text-[max(0.55rem,0.8cqw)] tracking-[0.09em] text-(--pres-ink-muted) uppercase"
        >
          <span className="min-w-0 truncate">{label}</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-[max(0.85rem,1.5cqw)] pb-[max(0.75rem,1.3cqw)] font-(family-name:--font-presentation-mono) text-[max(0.55rem,0.8cqw)] tracking-[0.09em] text-(--pres-ink-muted)">
          {isExpanded ? (
            <div
              className={`pointer-events-auto flex items-center gap-[1.25em] transition-opacity duration-500 ${controlsHidden ? "!pointer-events-none opacity-0" : "opacity-100"}`}
            >
              <button
                aria-label="Previous slide"
                className={controlButtonClass}
                disabled={currentIndex === 0}
                onClick={() => move("previous")}
                type="button"
              >
                <MoveLeft aria-hidden="true" size={14} />
              </button>
              <button
                aria-label="Next slide"
                className={controlButtonClass}
                disabled={currentIndex === slideCount - 1}
                onClick={() => move("next")}
                type="button"
              >
                <MoveRight aria-hidden="true" size={14} />
              </button>
              <button
                aria-label={isFullscreen ? "Exit fullscreen" : "Exit presentation"}
                className={controlButtonClass}
                onClick={() => {
                  if (isFullscreen) {
                    void exitFullscreen();
                  } else {
                    setIsTheater(false);
                  }
                }}
                type="button"
              >
                Exit
              </button>
            </div>
          ) : (
            <span />
          )}
          <span className="uppercase">
            {String(currentIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
          </span>
        </div>
      </div>

      {isExpanded ? null : (
        <div className="mt-3 flex items-center gap-[1.25em] px-1 font-(family-name:--font-presentation-mono) text-[0.7rem] tracking-[0.09em] text-(--pres-ink-muted)">
          <button
            aria-label="Previous slide"
            className={controlButtonClass}
            disabled={currentIndex === 0}
            onClick={() => move("previous")}
            type="button"
          >
            <MoveLeft aria-hidden="true" size={14} />
          </button>
          <button
            aria-label="Next slide"
            className={controlButtonClass}
            disabled={currentIndex === slideCount - 1}
            onClick={() => move("next")}
            type="button"
          >
            <MoveRight aria-hidden="true" size={14} />
          </button>
          <span className="flex-1" />
          <button
            aria-label="Present in the browser window (hold ⌘ for the whole display)"
            className={controlButtonClass}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey) {
                void enterFullscreen();
              } else {
                setIsTheater(true);
              }
            }}
            title="⌘-click for display fullscreen"
            type="button"
          >
            Fullscreen
          </button>
        </div>
      )}
      <p className="sr-only">Use left and right arrow keys, Page Up, Page Down, Home, or End to move through slides. Press F for fullscreen.</p>
      {fullscreenError ? <p className="sr-only" role="status">{fullscreenError}</p> : null}
    </section>
  );
}

export function PresentationSlide({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full items-center px-[max(1.25rem,7cqw)] pt-[max(3rem,8cqw)] pb-[max(3rem,8cqw)] font-(family-name:--font-presentation-serif) [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4 [&_blockquote]:border-l [&_blockquote]:border-(--pres-rule) [&_blockquote]:pl-[max(0.9rem,2.5cqw)] [&_blockquote]:text-(--pres-ink-muted) [&_h1]:max-w-[19ch] [&_h1]:text-[max(1.6rem,4.5cqw)] [&_h1]:leading-[1.08] [&_h1]:font-medium [&_h1]:tracking-[-0.025em] [&_h2]:max-w-[24ch] [&_h2]:text-[max(1.3rem,3.3cqw)] [&_h2]:leading-[1.12] [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_li]:mt-[0.45em] [&_ol]:mt-[1em] [&_ol]:list-decimal [&_ol]:pl-[1.4em] [&_p]:mt-[1em] [&_p]:max-w-[54ch] [&_p]:text-[max(0.78rem,1.4cqw)] [&_p]:leading-[1.55] [&_p]:text-(--pres-ink-muted) [&_strong]:font-semibold [&_ul]:mt-[1em] [&_ul]:list-disc [&_ul]:pl-[1.25em]">
      <div className="w-full">{children}</div>
    </div>
  );
}
