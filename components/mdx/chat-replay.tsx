"use client";

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from "react";
import { RotateCcw, SkipForward } from "lucide-react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { parsePiThread, type ReplayMessage } from "@/lib/pi-thread";

type PlaybackCommand = { id: number; action: "replay" | "skip" };
type ReplaySync = {
  command: PlaybackCommand;
  requestAutoStart: () => void;
  replay: () => void;
  skip: () => void;
};

const ReplaySyncContext = createContext<ReplaySync | null>(null);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useEntersViewport(onEnter: () => void) {
  const elementRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || enteredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || enteredRef.current) return;

        const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
        const fitsInViewport = entry.boundingClientRect.height <= viewportHeight;
        // Wait for the complete card when that is physically possible. On a
        // short viewport, accept the maximum useful view instead of leaving
        // autoplay unreachable forever.
        const ready = fitsInViewport
          ? entry.intersectionRatio >= 0.98
          : entry.intersectionRect.height >= viewportHeight * 0.9;
        if (!ready) return;

        enteredRef.current = true;
        observer.disconnect();
        onEnter();
      },
      { rootMargin: "-12px 0px", threshold: [0.25, 0.5, 0.75, 0.9, 0.98, 1] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onEnter]);

  return elementRef;
}

type PlaybackState = {
  phase: "idle" | "playing" | "complete";
  index: number;
  characters: number;
};

const initialPlayback: PlaybackState = { phase: "idle", index: 0, characters: 0 };

function nextChunkLength(text: string, offset: number) {
  const character = text[offset] ?? "";
  if (/\s/.test(character)) return 1;
  return Math.min(3 + (offset % 3), text.length - offset);
}

export function ChatReplay(props: { src: string; label?: string }) {
  return <ChatReplayPlayer key={props.src} {...props} />;
}

function ChatReplayPlayer({ src, label }: { src: string; label?: string }) {
  const [messages, setMessages] = useState<ReplayMessage[] | null>(null);
  const validSource = src.startsWith("/") && !src.startsWith("//");
  const [error, setError] = useState<string | null>(() =>
    validSource ? null : "ChatReplay src must be a same-origin public path beginning with /."
  );
  const [playback, setPlayback] = useState(initialPlayback);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sync = useContext(ReplaySyncContext);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    if (!validSource) return () => controller.abort();

    void fetch(src, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Could not load replay (${response.status}).`);
        return response.text();
      })
      .then((source) => setMessages(parsePiThread(source)))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not load replay.");
      });

    return () => controller.abort();
  }, [src, validSource]);

  const start = useCallback(() => {
    const shouldReduceMotion =
      reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPlayback(
      shouldReduceMotion
        ? { phase: "complete", index: Number.MAX_SAFE_INTEGER, characters: 0 }
        : { phase: "playing", index: 0, characters: 0 }
    );
  }, [reducedMotion]);

  const skip = useCallback(() => {
    setPlayback({ phase: "complete", index: Number.MAX_SAFE_INTEGER, characters: 0 });
  }, []);

  const syncCommand = sync?.command;
  useEffect(() => {
    if (!syncCommand || syncCommand.id === 0) return;
    const timer = window.setTimeout(() => {
      if (syncCommand.action === "skip") skip();
      else start();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [skip, start, syncCommand]);

  const requestAutoStart = useCallback(() => {
    if (sync) sync.requestAutoStart();
    else start();
  }, [start, sync]);
  const rootRef = useEntersViewport(requestAutoStart);

  useEffect(() => {
    if (!messages || playback.phase !== "playing") return;
    const message = messages[playback.index];
    if (!message) {
      const timer = window.setTimeout(
        () => setPlayback({ phase: "complete", index: messages.length, characters: 0 }),
        0
      );
      return () => window.clearTimeout(timer);
    }

    if (message.role === "user") {
      const timer = window.setTimeout(
        () => setPlayback((state) => ({ ...state, index: state.index + 1, characters: 0 })),
        650
      );
      return () => window.clearTimeout(timer);
    }

    if (playback.characters >= message.text.length) {
      const timer = window.setTimeout(
        () => setPlayback((state) => ({ ...state, index: state.index + 1, characters: 0 })),
        750
      );
      return () => window.clearTimeout(timer);
    }

    const delay = /[.!?]\s?$/.test(message.text.slice(0, playback.characters)) ? 80 : 28;
    const timer = window.setTimeout(() => {
      setPlayback((state) => ({
        ...state,
        characters: Math.min(
          message.text.length,
          state.characters + nextChunkLength(message.text, state.characters)
        )
      }));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [messages, playback]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [playback]);

  const visibleMessages =
    playback.phase === "idle"
      ? []
      : messages?.slice(
          0,
          playback.phase === "complete" ? messages.length : playback.index + 1
        );
  const isPlaying = playback.phase === "playing";

  const handleReplay = () => {
    if (sync) sync.replay();
    else start();
  };
  const handleSkip = () => {
    if (sync) sync.skip();
    else skip();
  };

  return (
    <div
      ref={rootRef}
      className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-surface font-sans text-fg"
      aria-busy={(messages === null && error === null) || isPlaying}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="truncate font-mono text-xs text-muted">{label ?? "Conversation replay"}</span>
        <div className="flex items-center gap-1">
          {isPlaying ? (
            <Button variant="ghost" size="xs" onClick={handleSkip} aria-label="Skip replay">
              <SkipForward />
              Skip
            </Button>
          ) : playback.phase === "complete" ? (
            <Button variant="ghost" size="xs" onClick={handleReplay} aria-label="Replay conversation">
              <RotateCcw />
              Replay
            </Button>
          ) : null}
        </div>
      </div>

      <div ref={viewportRef} className="min-h-72 max-h-[32rem] overflow-y-auto px-4 py-5">
        {error ? (
          <p role="alert" className="text-sm text-destructive-foreground">
            {error}
          </p>
        ) : !messages ? (
          <p className="text-sm text-muted">Loading conversation…</p>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleMessages?.map((message, index) => {
              const streaming = isPlaying && index === playback.index && message.role === "assistant";
              const text = streaming ? message.text.slice(0, playback.characters) : message.text;
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[88%] origin-bottom-right animate-[chat-message-send_280ms_var(--ease-smooth)_both] rounded-[1.75rem] bg-secondary px-5 py-3 text-base leading-[1.65] text-secondary-foreground motion-reduce:animate-none"
                      : "max-w-full text-base leading-[1.65]"
                  }
                >
                  {message.role === "assistant" ? (
                    <Streamdown
                      mode={streaming ? "streaming" : "static"}
                      isAnimating={streaming}
                      animated={!reducedMotion}
                      controls={false}
                      className="[&_p]:my-0 [&_p+p]:mt-3 [&_ul]:my-3 [&_ol]:my-3"
                    >
                      {text}
                    </Streamdown>
                  ) : (
                    <span className="whitespace-pre-wrap">{text}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SynchronizedReplays({ children }: { children: ReactNode }) {
  const [command, setCommand] = useState<PlaybackCommand>({ id: 0, action: "replay" });
  const autoStarted = useRef(false);
  const dispatch = (action: PlaybackCommand["action"]) =>
    setCommand((current) => ({ id: current.id + 1, action }));

  const value: ReplaySync = {
    command,
    requestAutoStart: () => {
      if (autoStarted.current) return;
      autoStarted.current = true;
      dispatch("replay");
    },
    replay: () => dispatch("replay"),
    skip: () => dispatch("skip")
  };

  return <ReplaySyncContext value={value}>{children}</ReplaySyncContext>;
}

export function ChatReplayComparison({
  children,
  synchronized = false
}: {
  children: ReactNode;
  synchronized?: boolean;
}) {
  const replays = Children.toArray(children).filter(
    (child): child is ReactElement => isValidElement(child)
  );
  const grid = (
    <div className="grid grid-cols-1 gap-4 @min-[44rem]:grid-cols-2">
      {replays}
    </div>
  );

  return (
    <div className="not-prose @container my-8">
      {synchronized ? <SynchronizedReplays>{grid}</SynchronizedReplays> : grid}
    </div>
  );
}
