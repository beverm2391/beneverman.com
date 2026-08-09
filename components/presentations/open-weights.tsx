import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";
import {
  SlideArrow,
  SlideFigure,
  SlideStack,
  SlideStatement
} from "@/components/mdx/presentation-parts";

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

// Two beats: the accusation, then the exit. The explanation in between is
// spoken, since the talk proves it later.
const thesis = [
  "You are becoming dependent on intelligence you neither own nor control. That dependence is the business model.",
  "Open-weight models are better for you now, will continue to get better, and you can run one yourself, today."
] as const;

export function OpenWeightsPresentation() {
  return (
    <Presentation
      label="Open Weight Models"
      monoFontClassName={openWeightsMono.variable}
      serifFontClassName={openWeightsSerif.variable}
    >
      <PresentationSlide>
        <SlideStack gap="none">
          <SlideStatement>{thesis[0]}</SlideStatement>
          <SlideArrow label="Thus" />
          <SlideStatement>{thesis[1]}</SlideStatement>
        </SlideStack>
      </PresentationSlide>

      {/* TEMPORARY figure proofs: generated art on the paper as-is, to judge
          seams and colour semantics before we commit to a pipeline. */}
      <PresentationSlide fill>
        <SlideFigure
          alt="Domain knowledge falls as reasoning is delegated while AI-assisted performance rises."
          caption="Fig. 01 — Growing dependence"
          frame={false}
          src="/images/blog/open-weights-ai-models/01-growing-dependence-transparent.png"
        />
      </PresentationSlide>

      <PresentationSlide fill>
        <SlideFigure
          alt="An open internet mesh with alternate routes above a closed AI funnel through one provider-controlled gateway."
          caption="Fig. 02 — Open internet vs closed AI"
          frame={false}
          src="/images/blog/open-weights-ai-models/02-open-internet-vs-closed-ai-transparent.png"
        />
      </PresentationSlide>
    </Presentation>
  );
}
