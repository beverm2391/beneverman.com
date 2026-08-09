import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";

const openWeightsSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-presentation-serif",
  display: "swap"
});

const openWeightsMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-presentation-mono",
  display: "swap"
});

// Shared text idioms for this deck. These stay local until the theme look is
// approved, then graduate into reusable slide primitives.
const kickerClass =
  "!mt-0 font-(family-name:--font-presentation-mono) !text-[max(0.55rem,0.8cqw)] tracking-[0.09em] !text-(--pres-annotation) uppercase";

const thesisStatementClass =
  "!mt-0 !max-w-[40ch] !text-[max(0.85rem,2cqw)] !leading-[1.3] !text-(--pres-ink)";

// Two beats: the accusation, then the exit. The explanation in between is
// spoken, since Part 2 proves it later.
const thesis = [
  "You are becoming dependent on intelligence you neither own nor control. That dependence is the business model.",
  "Open-weight models are better for you now, keep getting better without them, and you can run one yourself."
] as const;

// A downward arrow carrying the logical step between two statements. The
// stroke is drawn rather than typed so it scales with the slide and stays on
// the deck's annotation ink.
function ThesisArrow({ label }: { label: string }) {
  return (
    // The arrow sits on the slide's centre axis; the label hangs beside it
    // without pulling the stroke off centre.
    <div className="relative flex justify-center py-[max(0.7rem,1.7cqw)]">
      <svg
        aria-hidden="true"
        className="h-[max(1.6rem,3.4cqw)] w-[max(0.5rem,1cqw)] text-(--pres-annotation)"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 10 40"
      >
        <path d="M5 0 V34 M1 30 L5 35 L9 30" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute top-1/2 left-1/2 ml-[max(0.6rem,1.1cqw)] -translate-y-1/2 font-(family-name:--font-presentation-mono) text-[max(0.55rem,0.8cqw)] tracking-[0.09em] text-(--pres-annotation) uppercase">
        {label}
      </span>
    </div>
  );
}

export function OpenWeightsPresentation() {
  return (
    <Presentation
      label="Open Weight Models"
      monoFontClassName={openWeightsMono.variable}
      serifFontClassName={openWeightsSerif.variable}
    >
      {/* The deck opens on its thesis, read top to bottom as a chain: each
          statement flows into the next through a labelled arrow. */}
      <PresentationSlide>
        <div className="flex flex-col items-center text-center">
          {/* Both beats carry identical weight; only the arrow between them
              marks the logical step. */}
          <p className={thesisStatementClass}>{thesis[0]}</p>

          <ThesisArrow label="Thus" />

          <p className={thesisStatementClass}>{thesis[1]}</p>
        </div>
      </PresentationSlide>

      {/* TEMPORARY theme specimen: every deck idiom on one slide so the theme
          can be judged on real pixels. Delete once the look is settled. */}
      <PresentationSlide>
        <div className="grid gap-[max(0.9rem,2cqw)]">
          <p className={kickerClass}>Part 01 — Theme specimen</p>
          <h2 className="!mt-0">
            A section heading in serif ink,{" "}
            <span className="text-(--pres-annotation)">annotated in blue</span>
          </h2>
          <p className="!mt-0">
            Body text is muted serif at a comfortable measure. Inline emphasis
            uses <strong className="!text-(--pres-ink)">full ink</strong>, the
            annotation layer points at{" "}
            <span className="text-(--pres-annotation)">the machinery</span>, and
            the accent appears exactly once, on{" "}
            <span className="text-(--pres-accent)">the thing that controls you</span>.
          </p>

          <div className="grid gap-[max(0.7rem,1.4cqw)] border-t border-(--pres-rule) pt-[max(0.7rem,1.5cqw)] sm:grid-cols-3">
            <div>
              <p className={kickerClass}>Label</p>
              <p className="!mt-[0.45em] !text-[max(0.7rem,1.25cqw)] !leading-[1.42]">
                Column body under a mono kicker.
              </p>
            </div>
            <div>
              <p className={kickerClass}>Label</p>
              <p className="!mt-[0.45em] !text-[max(0.7rem,1.25cqw)] !leading-[1.42]">
                Columns share one hairline rule.
              </p>
            </div>
            <div>
              <p className="!mt-0 font-(family-name:--font-presentation-mono) !text-[max(0.55rem,0.8cqw)] tracking-[0.09em] !text-(--pres-accent) uppercase">
                Antagonist
              </p>
              <p className="!mt-[0.45em] !text-[max(0.7rem,1.25cqw)] !leading-[1.42]">
                Orange marks chokepoints only.
              </p>
            </div>
          </div>

          <p className="!mt-0 font-(family-name:--font-presentation-mono) !text-[max(0.55rem,0.8cqw)] tracking-[0.09em] !text-(--pres-ink-muted) uppercase">
            Fig. 01 — Figure captions render like this
          </p>
        </div>
      </PresentationSlide>
    </Presentation>
  );
}
