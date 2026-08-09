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
  "!mt-0 font-(family-name:--font-presentation-mono) !text-[clamp(0.55rem,0.8vw,0.7rem)] tracking-[0.09em] !text-(--pres-annotation) uppercase";

const thesis = [
  "You are becoming dependent on intelligence you neither own nor control. That dependence is the business model.",
  "Frontier labs optimize for profit (among other things), not for your value, privacy, or security.",
  "Open-weight models are better overall, since it’s easier to run when someone else hasn’t chained your ankles together."
] as const;

export function OpenWeightsPresentation() {
  return (
    <Presentation
      label="Open Weight Models"
      monoFontClassName={openWeightsMono.variable}
      serifFontClassName={openWeightsSerif.variable}
    >
      <PresentationSlide>
        <p className={kickerClass}>August 2026</p>
        <h1 className="!mt-[0.4em]">Open-weight models</h1>
        <p className="!mt-[1.2em] font-(family-name:--font-presentation-mono) !text-[clamp(0.6rem,0.95vw,0.8rem)] tracking-[0.09em] !text-(--pres-ink-muted) uppercase">
          Why owning the file matters
        </p>
      </PresentationSlide>

      <PresentationSlide>
        <div className="grid gap-[clamp(0.8rem,2.3vw,2rem)]">
          <p className="!mt-0 !max-w-[38ch] !text-[clamp(1rem,2.4vw,2.1rem)] !leading-[1.28] !text-(--pres-ink)">
            {thesis[0]}
          </p>

          <div className="grid gap-[clamp(0.7rem,1.4vw,1.2rem)] border-t border-(--pres-rule) pt-[clamp(0.7rem,1.5vw,1.3rem)] sm:grid-cols-2">
            <div>
              <p className={kickerClass}>Because</p>
              <p className="!mt-[0.45em] !max-w-[34ch] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                {thesis[1]}
              </p>
            </div>
            <div>
              <p className={kickerClass}>Thus</p>
              <p className="!mt-[0.45em] !max-w-[34ch] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                {thesis[2]}
              </p>
            </div>
          </div>
        </div>
      </PresentationSlide>

      {/* TEMPORARY theme specimen: every deck idiom on one slide so the theme
          can be judged on real pixels. Delete once the look is settled. */}
      <PresentationSlide>
        <div className="grid gap-[clamp(0.9rem,2vw,1.8rem)]">
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

          <div className="grid gap-[clamp(0.7rem,1.4vw,1.2rem)] border-t border-(--pres-rule) pt-[clamp(0.7rem,1.5vw,1.3rem)] sm:grid-cols-3">
            <div>
              <p className={kickerClass}>Label</p>
              <p className="!mt-[0.45em] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                Column body under a mono kicker.
              </p>
            </div>
            <div>
              <p className={kickerClass}>Label</p>
              <p className="!mt-[0.45em] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                Columns share one hairline rule.
              </p>
            </div>
            <div>
              <p className="!mt-0 font-(family-name:--font-presentation-mono) !text-[clamp(0.55rem,0.8vw,0.7rem)] tracking-[0.09em] !text-(--pres-accent) uppercase">
                Antagonist
              </p>
              <p className="!mt-[0.45em] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                Orange marks chokepoints only.
              </p>
            </div>
          </div>

          <p className="!mt-0 font-(family-name:--font-presentation-mono) !text-[clamp(0.55rem,0.8vw,0.7rem)] tracking-[0.09em] !text-(--pres-ink-muted) uppercase">
            Fig. 01 — Figure captions render like this
          </p>
        </div>
      </PresentationSlide>
    </Presentation>
  );
}
