import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";
import {
  SlideArrow,
  SlideBody,
  SlideColumn,
  SlideColumns,
  SlideFigure,
  SlideKicker,
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

const closedModels = [
  {
    provider: "OpenAI",
    name: "GPT-5.6 Sol",
    href: "https://developers.openai.com/api/docs/models/gpt-5.6-sol"
  },
  {
    provider: "Anthropic",
    name: "Claude Fable 5",
    href: "https://platform.claude.com/docs/en/about-claude/models/overview"
  },
  {
    provider: "Google",
    name: "Gemini 3.1 Pro Preview",
    href: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview"
  }
] as const;

const openModels = [
  {
    provider: "Alibaba / Qwen",
    name: "Qwen3.6-35B-A3B",
    href: "https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF"
  },
  {
    provider: "Moonshot AI",
    name: "Kimi-K3",
    href: "https://huggingface.co/unsloth/Kimi-K3-GGUF"
  },
  {
    provider: "DeepSeek",
    name: "DeepSeek-V4-Flash",
    href: "https://huggingface.co/unsloth/DeepSeek-V4-Flash-GGUF"
  }
] as const;

type ModelExample = {
  readonly href: string;
  readonly name: string;
  readonly provider: string;
};

function ModelList({ models }: { models: readonly ModelExample[] }) {
  return (
    <div className="grid gap-[max(0.75rem,1.4cqw)]">
      {models.map((model) => (
        <div key={model.name}>
          <SlideKicker>{model.provider}</SlideKicker>
          <a
            className="mt-[0.2em] block text-[max(0.8rem,1.65cqw)] leading-[1.25] text-(--pres-ink)"
            href={model.href}
            rel="noreferrer"
            target="_blank"
          >
            {model.name}
          </a>
        </div>
      ))}
    </div>
  );
}

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
          <h2>Closed vs open models</h2>
          <SlideColumns>
            <SlideColumn label="Closed">
              <ModelList models={closedModels} />
            </SlideColumn>
            <SlideColumn label="Open weight">
              <ModelList models={openModels} />
            </SlideColumn>
          </SlideColumns>
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
