import type { ReactNode } from "react";

// The deck's content vocabulary. Slides are composed from these pieces so
// every deck shares one type scale, one set of semantic inks, and one way to
// place artwork — instead of each slide re-inventing Tailwind. Everything
// sizes in cqw against the slide container, so a composition holds on a
// laptop, a projector, and the embedded card.

/** Semantic ink roles. `annotation` points at machinery; `accent` marks only the thing that controls you. */
type Tone = "annotation" | "muted" | "accent" | "ink";

const toneClass: Record<Tone, string> = {
  accent: "text-(--pres-accent)",
  annotation: "text-(--pres-annotation)",
  ink: "text-(--pres-ink)",
  muted: "text-(--pres-ink-muted)"
};

const monoClass =
  "font-(family-name:--font-presentation-mono) text-[max(0.55rem,0.8cqw)] tracking-[0.09em] uppercase";

/** Small mono label: section marks, column headers, figure references. */
export function SlideKicker({
  children,
  tone = "annotation"
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <p className={`!mt-0 ${monoClass} !${toneClass[tone]}`}>{children}</p>;
}

/**
 * A claim in the deck's speaking voice. `lead` is a slide's single dominant
 * statement; `equal` keeps several statements at one weight, for arguments
 * whose steps rank the same.
 */
export function SlideStatement({
  children,
  size = "equal"
}: {
  children: ReactNode;
  size?: "lead" | "equal";
}) {
  const scale =
    size === "lead"
      ? "!text-[max(1rem,2.9cqw)] !leading-[1.22] !max-w-[30ch]"
      : "!text-[max(0.85rem,2cqw)] !leading-[1.3] !max-w-[40ch]";

  return <p className={`!mt-0 ${scale} !text-(--pres-ink)`}>{children}</p>;
}

/**
 * A superscript reference marker, for claims the talk backs with a source.
 * Sits in the annotation ink so citations read as the same layer as labels
 * and figure callouts rather than as part of the sentence.
 */
export function SlideRef({ n }: { n: number }) {
  return (
    <sup className="ml-[0.1em] align-super font-(family-name:--font-presentation-mono) text-[0.5em] text-(--pres-annotation)">
      {n}
    </sup>
  );
}

/**
 * Sources for a slide's marked claims, pinned under the content. Numbers match
 * the SlideRef markers in the body, and titles link out so the deck carries its
 * own evidence rather than relying on the talk track.
 */
export function SlideNotes({
  notes,
  size = "footnote"
}: {
  notes: readonly { href: string; n: number; title: string }[];
  /**
   * `footnote` is the strip under a slide, for the rare case where the source
   * is the argument. `slide` is the references slide that collects the deck's
   * numbered sources, which is where most of them belong: nobody reads a
   * citation off a projector, so the marker carries the credibility and the
   * list carries the evidence.
   */
  size?: "footnote" | "slide";
}) {
  const scale = size === "slide" ? "!text-[max(0.6rem,1cqw)]" : "!text-[max(0.5rem,0.72cqw)]";

  return (
    <ol className={`!mt-0 grid list-none !pl-0 ${size === "slide" ? "gap-[0.9em]" : "gap-[0.3em]"}`}>
      {notes.map((note) => (
        <li className={`!mt-0 flex gap-[0.6em] ${monoClass} ${scale} normal-case`} key={note.n}>
          <span className={toneClass.annotation}>{note.n}</span>
          <a className={`${toneClass.muted} underline decoration-1 underline-offset-4`} href={note.href} rel="noreferrer" target="_blank">
            {note.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Supporting prose. Quieter than a statement; use sparingly on a spoken slide. */
export function SlideBody({ children }: { children: ReactNode }) {
  return (
    <p className="!mt-0 !max-w-[54ch] !text-[max(0.7rem,1.25cqw)] !leading-[1.45] !text-(--pres-ink-muted)">
      {children}
    </p>
  );
}

/**
 * A labelled arrow marking a logical step between statements. The stroke sits
 * on the stack's centre axis; the label hangs beside it so it cannot pull the
 * arrow off centre.
 */
export function SlideArrow({ label, tone = "annotation" }: { label?: string; tone?: Tone }) {
  return (
    <div className={`relative flex justify-center py-[max(0.7rem,1.7cqw)] ${toneClass[tone]}`}>
      <svg
        aria-hidden="true"
        className="h-[max(1.6rem,3.4cqw)] w-[max(0.5rem,1cqw)]"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 10 40"
      >
        <path
          d="M5 0 V34 M1 30 L5 35 L9 30"
          stroke="currentColor"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {label ? (
        <span className={`absolute top-1/2 left-1/2 ml-[max(0.6rem,1.1cqw)] -translate-y-1/2 ${monoClass}`}>
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** Vertical composition for a slide's content, with the deck's rhythm built in. */
export function SlideStack({
  align = "center",
  children,
  gap = "normal"
}: {
  align?: "center" | "start";
  children: ReactNode;
  gap?: "none" | "tight" | "normal";
}) {
  const gapClass = {
    none: "",
    normal: "gap-[max(0.9rem,2cqw)]",
    tight: "gap-[max(0.5rem,1.1cqw)]"
  }[gap];

  return (
    <div
      className={`flex flex-col ${gapClass} ${
        align === "center" ? "items-center text-center" : "items-start text-left"
      }`}
    >
      {children}
    </div>
  );
}

type SlideTimelineMark = {
  /** Position on the axis, in the same units as start/end. */
  at: number;
  /** Big statement above the axis, e.g. a price. */
  label?: ReactNode;
  /** Small mono line under the year, e.g. a company stage. */
  sublabel?: ReactNode;
  /** Ink for the stage line. Accent marks the stage that harms; neutral
   *  hinge events (an IPO) take ink; machinery defaults to annotation. */
  tone?: Tone;
  /** Mono text below the axis, e.g. "2015–2017" or "Now". */
  yearLabel?: string;
};

/**
 * A horizontal time axis, for arguments that are really about trajectory.
 * Drawn in the deck's drafting register: the axis and ticks are working
 * (annotation) ink, and each mark seats its content directly on the line —
 * statement above, year and stage annotations below.
 */
export function SlideTimeline({
  end,
  marks,
  start
}: {
  end: number;
  marks: readonly SlideTimelineMark[];
  start: number;
}) {
  const pct = (value: number) => ((value - start) / (end - start)) * 100;
  // Statements sit above the axis; the year-and-stage annotations hang in two
  // rows below it, so the felt quantity and the machinery never share a band.
  const axisTop = 55;

  return (
    <div className="relative w-full" style={{ height: "max(8.5rem,19cqw)" }}>
      <div
        className="absolute inset-x-0 border-t border-(--pres-annotation)"
        style={{ top: `${axisTop}%` }}
      />
      <svg
        aria-hidden="true"
        className="absolute right-0 w-[max(0.45rem,0.8cqw)] -translate-y-1/2 text-(--pres-annotation)"
        fill="none"
        style={{ top: `${axisTop}%` }}
        viewBox="0 0 8 12"
      >
        <path d="M1 1 L7 6 L1 11" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </svg>
      {marks.map((mark) => {
        // Marks near either edge align outward so their text stays on the
        // slide; everything else centers on its tick.
        const p = pct(mark.at);
        const align = p < 12 ? "start" : p > 88 ? "end" : "center";
        const translateX = align === "center" ? "-50%" : align === "end" ? "-100%" : "0";
        const itemsClass =
          align === "center"
            ? "items-center text-center"
            : align === "end"
              ? "items-end text-right"
              : "items-start text-left";

        return (
          <div className="absolute inset-y-0" key={mark.at} style={{ left: `${p}%` }}>
            <div
              className="absolute w-px bg-(--pres-annotation)"
              style={{ height: "10%", top: `${axisTop - 5}%` }}
            />
            {mark.label ? (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  bottom: `${100 - axisTop + 7}%`,
                  transform: `translateX(${translateX})`
                }}
              >
                <SlideStatement size="lead">{mark.label}</SlideStatement>
              </div>
            ) : null}
            {mark.yearLabel || mark.sublabel ? (
              <div
                className={`absolute flex flex-col gap-[0.55em] whitespace-nowrap ${itemsClass}`}
                style={{
                  top: `${axisTop + 9}%`,
                  transform: `translateX(${translateX})`
                }}
              >
                {mark.yearLabel ? (
                  <p className={`!mt-0 !max-w-none ${monoClass} !text-(--pres-ink)`}>
                    {mark.yearLabel}
                  </p>
                ) : null}
                {mark.sublabel ? (
                  <SlideKicker tone={mark.tone ?? "annotation"}>{mark.sublabel}</SlideKicker>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Columns under a shared hairline: parallel items that rank equally. */
export function SlideColumns({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full gap-[max(0.7rem,1.4cqw)] border-t border-(--pres-rule) pt-[max(0.7rem,1.5cqw)] text-left sm:grid-flow-col sm:auto-cols-fr">
      {children}
    </div>
  );
}

/** One column: a mono label over its content. */
export function SlideColumn({
  children,
  label,
  tone = "annotation"
}: {
  children: ReactNode;
  label: string;
  tone?: Tone;
}) {
  return (
    <div>
      <SlideKicker tone={tone}>{label}</SlideKicker>
      <div className="mt-[0.45em]">{children}</div>
    </div>
  );
}

/**
 * Artwork on a slide. Blog images render through ZoomImage (lightbox, site
 * tokens); a slide needs neither — clicking a slide means "present" — so deck
 * figures get their own primitive. Use inside `<PresentationSlide fill>`.
 */
export function SlideFigure({
  alt,
  caption,
  frame = true,
  src
}: {
  alt: string;
  caption?: string;
  /**
   * Draws the blog's framed-figure treatment (hairline, radius, inset), which
   * also contains artwork whose own background differs from the paper. Drop it
   * for transparent art that should sit directly on the slide.
   */
  frame?: boolean;
  src: string;
}) {
  return (
    <figure className="flex h-full min-h-0 flex-col items-center justify-center gap-[max(0.6rem,1.2cqw)]">
      {/* Deck art is local and pre-sized to the slide, so next/image's box
          would only add layout shift mid-presentation. The frame hugs the
          artwork with no inset: art carrying its own baked-in background
          would otherwise show a second rectangle inside the border. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className={`mx-auto max-h-full min-h-0 w-auto max-w-full flex-1 object-contain ${
          frame ? "rounded-[max(0.4rem,0.9cqw)] border border-(--pres-rule)" : ""
        }`}
        src={src}
      />
      {caption ? (
        <figcaption className={`${monoClass} ${toneClass.muted}`}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}
