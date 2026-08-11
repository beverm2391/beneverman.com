import { SlideKicker } from "@/components/mdx/presentation-parts";

// Reference data behind the deck: the model landscape, the deck's numbered
// sources, and the thesis lines. Slides live in slides.tsx; this file only
// holds what they point at.

type ModelTier = {
  readonly href: string;
  readonly name: string;
  readonly scale: string;
};

type ProviderModels = {
  readonly models: readonly ModelTier[];
  readonly provider: string;
};

export const closedProviders = [
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

export const openProviders = [
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

export function ModelList({ providers }: { providers: readonly ProviderModels[] }) {
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
// body, and the references slide at the end carries the sources. Only sources
// Ben has read enter this list; agent-verified candidates wait in slide notes.
export const sources = [
  {
    n: 1,
    title: "Milton Friedman, The Social Responsibility of Business Is to Increase Its Profits",
    href: "https://www.enriquedans.com/wp-content/uploads/2019/08/friedman.pdf"
  },
  {
    n: 2,
    title: "KLIM, Ai-1 Airbag Vest — subscription FAQ",
    href: "https://www.klim.com/Ai-1-Airbag-Vest-3046-000"
  },
  {
    n: 3,
    title: "r/uber, Rate at airport $44, rate after walking off airport property $9 (Oct 2025)",
    href: "https://www.reddit.com/r/uber/comments/1nxyf4y/rate_at_airport_44_rate_after_walking_off_airport/"
  },
  {
    n: 4,
    title: "New Mexico DOJ, landmark verdict against Meta",
    href: "https://nmdoj.gov/press-release/new-mexico-department-of-justice-wins-landmark-verdict-against-meta/"
  },
  {
    n: 5,
    title: "AP News, final New Mexico judgment brings Meta's responsibility to $942 million",
    href: "https://apnews.com/article/meta-court-ruling-mental-health-online-platforms-21b425faf745d0f736b310ebd8bc6b89"
  },
  {
    n: 6,
    title: "State of New Mexico v. Meta, complaint (allegations)",
    href: "https://nmdoj.gov/wp-content/uploads/2024/01/2023-12-05-NM-v.-Meta-et-al.-COMPLAINT-REDACTED.pdf"
  }
] as const;

// Two beats: the accusation, then the exit. The explanation in between is
// spoken, since the talk proves it later.
export const thesis = [
  "You are becoming dependent on intelligence you neither own nor control. That dependence is the business model.",
  "Open-weight models are better for you now, will continue to get better, and you can run one yourself, today."
] as const;
