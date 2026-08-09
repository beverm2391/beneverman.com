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
        <h1>Open-weight models</h1>
      </PresentationSlide>

      <PresentationSlide>
        <div className="grid gap-[clamp(0.8rem,2.3vw,2rem)]">
          <p className="!mt-0 !max-w-[38ch] !text-[clamp(1rem,2.4vw,2.1rem)] !leading-[1.28] !text-current">
            {thesis[0]}
          </p>

          <div className="grid gap-[clamp(0.7rem,1.4vw,1.2rem)] border-t border-border pt-[clamp(0.7rem,1.5vw,1.3rem)] sm:grid-cols-2">
            <div>
              <p className="!mt-0 font-(family-name:--font-presentation-mono) !text-[clamp(0.55rem,0.8vw,0.7rem)] tracking-[0.09em] !text-muted uppercase">
                Because
              </p>
              <p className="!mt-[0.45em] !max-w-[34ch] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                {thesis[1]}
              </p>
            </div>
            <div>
              <p className="!mt-0 font-(family-name:--font-presentation-mono) !text-[clamp(0.55rem,0.8vw,0.7rem)] tracking-[0.09em] !text-muted uppercase">
                Thus
              </p>
              <p className="!mt-[0.45em] !max-w-[34ch] !text-[clamp(0.72rem,1.25vw,1.05rem)] !leading-[1.42]">
                {thesis[2]}
              </p>
            </div>
          </div>
        </div>
      </PresentationSlide>
    </Presentation>
  );
}
