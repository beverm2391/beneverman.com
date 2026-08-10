import { PresentationSlide } from "@/components/mdx/presentation";
import {
  SlideArrow,
  SlideBody,
  SlideColumn,
  SlideColumns,
  SlideFigure,
  SlideKicker,
  SlideNotes,
  SlideRef,
  SlideStack,
  SlideStatement
} from "@/components/mdx/presentation-parts";

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

// Numbering runs continuously across the deck: SlideRef marks a claim in the
// body, and the references slide at the end carries the sources.
const sources = [
  {
    n: 1,
    title: "Milton Friedman, The Social Responsibility of Business Is to Increase Its Profits",
    href: "https://www.enriquedans.com/wp-content/uploads/2019/08/friedman.pdf"
  },
  {
    n: 2,
    title: "Cory Doctorow, The 'Enshittification' of TikTok",
    href: "https://www.wired.com/story/tiktok-platforms-cory-doctorow/"
  }
] as const;

// Two beats: the accusation, then the exit. The explanation in between is
// spoken, since the talk proves it later.
const thesis = [
  "You are becoming dependent on intelligence you neither own nor control. That dependence is the business model.",
  "Open-weight models are better for you now, will continue to get better, and you can run one yourself, today."
] as const;

// The bench: every slide the talk has in play, defined once and keyed by name.
// A setlist in index.tsx picks and orders slides from here, so reordering the
// talk or benching a slide never touches the slide itself. The bench is for
// slides in play — current setlists, the appendix, or material awaiting a
// restructure. Slides retired for good die in git history, not here.
export const slides = {
  "title": (
    <PresentationSlide layout="center">
      <SlideStack gap="tight">
        <h1>Open Weight Models</h1>
        <SlideStatement>The $10 Uber you get to keep forever.</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The hook act. The audience has lived the platform squeeze several times;
  // these three slides let their own memories make the argument, then name AI
  // as the next one in line, then reveal the exit that the earlier squeezes
  // never had. The talk's promise is set by the end of "hook-the-door".
  "hook-montage": (
    <PresentationSlide note="Cold open. Ask who remembers $10 Ubers. Let the montage do the arguing — the pattern has a name (ref 2) but do not lecture it.">
      <SlideStack align="start">
        <h2>
          You have seen this movie before
          <SlideRef n={2} />
        </h2>
        <SlideColumns>
          <SlideColumn label="Uber">
            <p className="!mt-0">$10 across town</p>
            <p className="!text-(--pres-ink)">$70, plus surge</p>
          </SlideColumn>
          <SlideColumn label="Netflix">
            <p className="!mt-0">$8. No ads.</p>
            <p className="!text-(--pres-ink)">$25. Or ads.</p>
          </SlideColumn>
          <SlideColumn label="Instagram">
            <p className="!mt-0">Your friends, in order</p>
            <p className="!text-(--pres-ink)">Ads wearing your friends&rsquo; faces</p>
          </SlideColumn>
        </SlideColumns>
      </SlideStack>
    </PresentationSlide>
  ),

  "hook-ai-next": (
    <PresentationSlide layout="center" note="Spoken: the early signs are already here — ads coming to ChatGPT, models deprecated overnight and grieved, personality changes nobody voted on.">
      <SlideStack>
        <SlideStatement size="lead">AI is at the $10-Uber stage.</SlideStatement>
        <SlideBody>
          Free tiers that lose billions. Prices set to build a habit, not to
          make a profit. The debt always comes due — from you.
        </SlideBody>
      </SlideStack>
    </PresentationSlide>
  ),

  "hook-the-door": (
    <PresentationSlide layout="center" note="The bridge. The next slide must answer: what file?">
      <SlideStack gap="none">
        <SlideStatement>
          Every other time, there was no exit. You could not download the 2015
          Uber.
        </SlideStatement>
        <SlideArrow label="But" />
        <SlideStatement size="lead">
          This time, the good version leaked out the door. As a file.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "model-landscape": (
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
  ),

  "what-is-a-weight": (
    <PresentationSlide>
      <SlideStack align="start">
        <h2>What is a weight?</h2>
        <ul>
          <li>An affine function, y = mx + b</li>
          <li>Composed into matrices, matmuls</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "fig-what-is-a-weight": (
    <PresentationSlide
      layout="fill"
      note="Fig 03: upscale pending. Text fidelity to improve."
    >
      <SlideFigure
        alt="One affine unit, a layer of those units as a matrix, and the matrix as a file on disk."
        caption="Fig. 03. What is a weight"
        frame={false}
        src="/images/blog/open-weights-ai-models/03-what-is-a-weight.png"
      />
    </PresentationSlide>
  ),

  "fig-text-through-weights": (
    <PresentationSlide
      layout="fill"
      note="Fig 04: redraw with real word fragments in the token boxes, they are empty so tokenizing is asserted rather than shown. Upscale pending."
    >
      <SlideFigure
        alt="Prompt tokenized, passed through the weights, emitted one token at a time."
        caption="Fig. 04. Text through the weights"
        frame={false}
        src="/images/blog/open-weights-ai-models/04-text-through-weights.png"
      />
    </PresentationSlide>
  ),

  "thesis": (
    <PresentationSlide layout="center">
      <SlideStack gap="none">
        <SlideStatement>{thesis[0]}</SlideStatement>
        <SlideArrow label="Thus" />
        <SlideStatement>{thesis[1]}</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The map for the middle of the talk: name both problems, then take them
  // one at a time.
  "closed-model-problems": (
    <PresentationSlide>
      <SlideStack align="start">
        <h2>Major Problems with Closed Weight Models</h2>
        <ul>
          <li>Optimized for retention and revenue (your dependence)</li>
          <li>Dependence carries risk</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "optimized-for-retention": (
    <PresentationSlide>
      <SlideStack align="start">
        <h2>Optimized for retention and revenue</h2>
        <SlideStatement>
          Corporations optimize for shareholder value
          <SlideRef n={1} />, aka revenue, which is driven by user retention.
        </SlideStatement>
        <ul>
          <li>
            Retention gets optimized even at the expense of the user
            <ul>
              <li>Sycophancy</li>
              <li>Engagement loops, RL toward follow-up questions</li>
              <li>Meta, the played out version of where this goes</li>
            </ul>
          </li>
          <li>
            Liability removes what would have helped you
            <ul>
              <li>Safety classifiers</li>
              <li>Soft and covert refusal</li>
            </ul>
          </li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "dependence-risk": (
    <PresentationSlide note="Needs its content. Elasticity analogy, latte vs heart medication, then what you already run on AI.">
      <SlideStack align="start">
        <h2>Why dependence carries risk</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "fig-retention-diverges": (
    <PresentationSlide
      layout="fill"
      note="Fig 05: redraw. Curves must start as one line, not two. Keep push and pull. Drop OPTIMIZED FOR THEM NOT YOU and the solid fill. Replace the fill with a dotted bracket labelled LOST VALUE. Label the y axis VALUE. Base it on this version."
    >
      <SlideFigure
        alt="Retention and user value rise together, then diverge under optimization pressure."
        caption="Fig. 05. Retention diverges from value"
        frame={false}
        src="/images/blog/open-weights-ai-models/05-retention-diverges-from-value.png"
      />
    </PresentationSlide>
  ),

  // Parked figures: real content, not yet placed in the argument.
  "fig-growing-dependence": (
    <PresentationSlide layout="fill">
      <SlideFigure
        alt="Domain knowledge falls as reasoning is delegated while AI-assisted performance rises."
        caption="Fig. 01. Growing dependence"
        frame={false}
        src="/images/blog/open-weights-ai-models/01-growing-dependence.png"
      />
    </PresentationSlide>
  ),

  "fig-open-internet-vs-closed-ai": (
    <PresentationSlide layout="fill">
      <SlideFigure
        alt="An open internet mesh with alternate routes above a closed AI funnel through one provider-controlled gateway."
        caption="Fig. 02. Open internet vs closed AI"
        frame={false}
        src="/images/blog/open-weights-ai-models/02-open-internet-vs-closed-ai.png"
      />
    </PresentationSlide>
  ),

  "references": (
    <PresentationSlide>
      <SlideStack align="start">
        <h2>References</h2>
        <SlideNotes notes={sources} size="slide" />
      </SlideStack>
    </PresentationSlide>
  )
} as const;

export type SlideName = keyof typeof slides;
