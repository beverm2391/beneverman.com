import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";
import {
  SlideArrow,
  SlideBody,
  SlideColumn,
  SlideColumns,
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
      <PresentationSlide layout="center">
        <SlideStack>
          <h1>Open Weight Models</h1>
        </SlideStack>
      </PresentationSlide>

      <PresentationSlide>
        <SlideStack align="start">
          <h2>Closed vs Open models</h2>
          <ul>
            <li>
              Closed
              <ul>
                <li>Claude</li>
                <li>GPT-5.6</li>
                <li>Gemini 3</li>
              </ul>
            </li>
            <li>
              Open
              <ul>
                <li>Qwen 3.8</li>
                <li>Kimi K.3</li>
                <li>DeepSeek V4 Flash</li>
              </ul>
            </li>
          </ul>
        </SlideStack>
      </PresentationSlide>

      <PresentationSlide>
        <SlideStack align="start">
          <h2>What is a weight?</h2>
          <ul>
            <li>An affine function, y = mx + b</li>
            <li>Composed into matrices, matmuls</li>
          </ul>
        </SlideStack>
      </PresentationSlide>

      <PresentationSlide layout="center">
        <SlideStack gap="none">
          <SlideStatement>{thesis[0]}</SlideStatement>
          <SlideArrow label="Thus" />
          <SlideStatement>{thesis[1]}</SlideStatement>
        </SlideStack>
      </PresentationSlide>

      {/* The map for the middle of the talk: name both problems, then take
          them one at a time. */}
      <PresentationSlide>
        <SlideStack>
          <SlideStatement>Two problems with renting intelligence</SlideStatement>
          <SlideColumns>
            <SlideColumn label="01. Dependence">
              <SlideBody>
                The more you rely on it, the more it costs you to lose it, and
                the less say you have in what it costs.
              </SlideBody>
            </SlideColumn>
            <SlideColumn label="02. Incentives">
              <SlideBody>
                It is optimized for their revenue, not your value. Those come
                apart in ways you cannot see.
              </SlideBody>
            </SlideColumn>
          </SlideColumns>
        </SlideStack>
      </PresentationSlide>

      {/* Parked figures: real content, not yet placed in the argument. */}
      <PresentationSlide layout="fill">
        <SlideFigure
          alt="Domain knowledge falls as reasoning is delegated while AI-assisted performance rises."
          caption="Fig. 01. Growing dependence"
          frame={false}
          src="/images/blog/open-weights-ai-models/01-growing-dependence.png"
        />
      </PresentationSlide>

      <PresentationSlide layout="fill">
        <SlideFigure
          alt="An open internet mesh with alternate routes above a closed AI funnel through one provider-controlled gateway."
          caption="Fig. 02. Open internet vs closed AI"
          frame={false}
          src="/images/blog/open-weights-ai-models/02-open-internet-vs-closed-ai.png"
        />
      </PresentationSlide>
    </Presentation>
  );
}
