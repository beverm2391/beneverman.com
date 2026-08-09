import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";
import {
  SlideArrow,
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

type ModelTier = {
  readonly href: string;
  readonly name: string;
  readonly scale: string;
};

type ProviderModels = {
  readonly models: readonly ModelTier[];
  readonly provider: string;
};

const closedProviders = [
  {
    provider: "OpenAI",
    models: [
      {
        name: "GPT-5.6 Sol",
        scale: "frontier",
        href: "https://developers.openai.com/api/docs/models/gpt-5.6-sol"
      },
      {
        name: "GPT-5.6 Terra",
        scale: "balanced",
        href: "https://developers.openai.com/api/docs/models/gpt-5.6-terra"
      },
      {
        name: "GPT-5.6 Luna",
        scale: "fast",
        href: "https://developers.openai.com/api/docs/models/gpt-5.6-luna"
      }
    ]
  },
  {
    provider: "Anthropic",
    models: [
      {
        name: "Claude Fable 5",
        scale: "maximum",
        href: "https://platform.claude.com/docs/en/about-claude/models/overview"
      },
      {
        name: "Claude Sonnet 5",
        scale: "balanced",
        href: "https://platform.claude.com/docs/en/about-claude/models/overview"
      },
      {
        name: "Claude Haiku 4.5",
        scale: "fast",
        href: "https://platform.claude.com/docs/en/about-claude/models/overview"
      }
    ]
  },
  {
    provider: "Google",
    models: [
      {
        name: "Gemini 3.1 Pro Preview",
        scale: "maximum",
        href: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview"
      },
      {
        name: "Gemini 3.6 Flash",
        scale: "balanced",
        href: "https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash"
      },
      {
        name: "Gemini 3.5 Flash-Lite",
        scale: "fast",
        href: "https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite"
      }
    ]
  }
] as const;

const openProviders = [
  {
    provider: "Alibaba / Qwen",
    models: [
      {
        name: "Qwen3.6-35B-A3B",
        scale: "35B / 3B active",
        href: "https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF"
      },
      {
        name: "Qwen3.5-122B-A10B",
        scale: "122B / 10B active",
        href: "https://huggingface.co/unsloth/Qwen3.5-122B-A10B-GGUF"
      },
      {
        name: "Qwen3.8-Max",
        scale: "2.4T / 95B active",
        href: "https://qwen.ai/blog?id=qwen3.8"
      }
    ]
  },
  {
    provider: "Moonshot AI",
    models: [
      {
        name: "Moonlight-16B-A3B-Instruct",
        scale: "16B / 3B active",
        href: "https://huggingface.co/mmnga/Moonlight-16B-A3B-Instruct-gguf"
      },
      {
        name: "Kimi-Linear-48B-A3B-Instruct",
        scale: "48B / 3B active",
        href: "https://huggingface.co/bartowski/moonshotai_Kimi-Linear-48B-A3B-Instruct-GGUF"
      },
      {
        name: "Kimi-K3",
        scale: "2.8T / 104B active",
        href: "https://huggingface.co/unsloth/Kimi-K3-GGUF"
      }
    ]
  },
  {
    provider: "DeepSeek",
    models: [
      {
        name: "DeepSeek-R1-0528-Qwen3-8B",
        scale: "8B",
        href: "https://huggingface.co/unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF"
      },
      {
        name: "DeepSeek-V4-Flash",
        scale: "284B / 13B active",
        href: "https://huggingface.co/unsloth/DeepSeek-V4-Flash-GGUF"
      },
      {
        name: "DeepSeek-V4-Pro",
        scale: "1.6T / 49B",
        href: "https://huggingface.co/nvidia/DeepSeek-V4-Pro-NVFP4"
      }
    ]
  }
] as const;

function ModelList({ providers }: { providers: readonly ProviderModels[] }) {
  return (
    <div className="grid gap-[max(0.3rem,0.6cqw)]">
      {providers.map((provider) => (
        <div key={provider.provider}>
          <SlideKicker>{provider.provider}</SlideKicker>
          <div className="mt-[0.25em] grid gap-[0.12em]">
            {provider.models.map((model) => (
              <a
                className="flex items-baseline justify-between gap-[0.8em] text-[max(0.68rem,1.18cqw)] leading-[1.25] text-(--pres-ink)"
                href={model.href}
                key={model.name}
                rel="noreferrer"
                target="_blank"
              >
                <span>{model.name}</span>
                <span className="shrink-0 font-(family-name:--font-presentation-mono) text-[0.68em] text-(--pres-muted)">
                  {model.scale}
                </span>
              </a>
            ))}
          </div>
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
              <ModelList providers={closedProviders} />
            </SlideColumn>
            <SlideColumn label="Open">
              <ModelList providers={openProviders} />
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

      {/* Candidates for the weight explainer. Keep one, drop the rest. */}
      <PresentationSlide layout="fill">
        <SlideFigure
          alt="Weight explainer, flat drafting strip variant."
          caption="Option 1. Flat drafting strip"
          frame={false}
          src="/images/blog/open-weights-ai-models/03-1-what-is-a-weight-flat-drafting-strip.png"
        />
      </PresentationSlide>

      <PresentationSlide layout="fill">
        <SlideFigure
          alt="Weight explainer, tiled number system variant."
          caption="Option 2. Tiled number system"
          frame={false}
          src="/images/blog/open-weights-ai-models/03-2-what-is-a-weight-tiled-number-system.png"
        />
      </PresentationSlide>

      <PresentationSlide layout="fill">
        <SlideFigure
          alt="Weight explainer, blueprint assembly variant."
          caption="Option 3. Blueprint assembly"
          frame={false}
          src="/images/blog/open-weights-ai-models/03-3-what-is-a-weight-blueprint-assembly.png"
        />
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
        <SlideStack align="start">
          <h2>Two problems</h2>
          <ul>
            <li>Optimized for retention and revenue, your dependence</li>
            <li>Dependence carries risk</li>
          </ul>
        </SlideStack>
      </PresentationSlide>

      <PresentationSlide>
        <SlideStack align="start">
          <h2>Optimized for retention and revenue</h2>
          <ul>
            <li>Adoption, habit, and dependence drive retention</li>
            <li>Retention produces revenue</li>
            <li>The effects land on you: deskilling, overreliance, sycophancy</li>
          </ul>
        </SlideStack>
      </PresentationSlide>

      <PresentationSlide>
        <SlideStack align="start">
          <h2>Why dependence carries risk</h2>
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
