# Research 07, the performance comparisons (delivered)

Feeds the `performance` spine slide after why-open-weights. Delivered by
Codex August 12, 2026, supplied by Ben. The two comparisons below are the
cleanest defensible ones. Official images are downloaded to
`public/images/blog/open-weights-ai-models/screenshots/`
(`qwen38-benchmark-table.png`, `qwen38-hero.png`, `kimi-logo.png`).

## 1. Kimi K3 vs Claude Fable 5

Vendor-reported benchmarks (Moonshot's own evaluation):

| Benchmark | Kimi K3 | Fable 5 |
|---|---:|---:|
| Terminal-Bench 2.1 | **88.3** | 88.0 |
| DeepSWE | 67.5 | **70.0** |
| FrontierSWE | 81.2 | **86.6** |
| BrowseComp | **91.2** | 88.0 |
| MCPMark-Verified | **94.5** | 87.4 |

Cost per 1M tokens: K3 $3 / $0.30 cached / $15 out; Fable 5 $10 / $1 / $50.
Fable costs 3.33x more in every category; K3 is 70% cheaper.

Moonshot's honest line, quotable: "While its overall performance still
trails the most powerful proprietary models, namely Claude Fable 5 and
GPT-5.6 Sol..."

Sources:
- [Kimi K3 technical report PDF](https://github.com/MoonshotAI/Kimi-K3/raw/main/k3_tech_report.pdf) —
  Figure 1 p1, full table p27, methodology p26. Strongest visual receipt.
- [Official benchmark table](https://www.kimi.com/blog/kimi-k3#full-benchmark-table)
- [Kimi pricing](https://platform.kimi.ai/docs/pricing/chat-k3) ·
  [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Kimi K3 model card](https://huggingface.co/moonshotai/Kimi-K3)

Caveats: vendor-reported; harnesses differ; Fable experienced fallbacks on
part of one evaluation. Do NOT convert into "K3 beats Claude overall."
For a Codex-heavy audience: vs GPT-5.6 Sol, K3 is 40% cheaper on input,
50% on output ([OpenAI pricing](https://developers.openai.com/api/docs/pricing)).

## 2. Qwen3.8-Max vs Claude Opus 4.8

Opus is the cleanest comparator: Alibaba evaluated both through Claude
Code (GPT-5.6 Sol went through Codex, less controlled).

| Benchmark | Qwen3.8-Max | Opus 4.8 |
|---|---:|---:|
| Terminal-Bench 2.1 | **86.6** | 84.6 |
| SWE-bench Pro | 67.7 | **69.2** |
| CoWorkBench | **74.8** | 72.3 |
| WorkSpaceBench | **67.7** | 66.8 |
| Toolathlon Verified | 72.5 | **76.2** |

Cost per 1M tokens (QwenCloud conservative international pricing):
Qwen3.8-Max $2 in / $6 out; Opus 4.8 $5 / $25. Qwen 2.5x cheaper on input,
4.17x on output. (US/global endpoints list $1.65/$4.951 — use $2/$6 in the
main comparison to avoid looking cherry-picked.)

Quotable: "Qwen3.8 brings a Qwen-Max-class model to open release."

Dates: launch article August 2, 2026; weights on Hugging Face August 8.

Sources:
- [Official benchmark table PNG](https://yqintl.alicdn.com/82e9fc5a61c0a2f1b2cc7492640eb80c4a35c014.png) ·
  [hero graphic](https://yqintl.alicdn.com/1ab611f7051a9845382b166092e781edb59dbab1.png)
- [Launch article](https://qwen.ai/blog?id=qwen3.8) ·
  [QwenCloud pricing](https://www.qwencloud.com/models/qwen3.8-max) ·
  [Alibaba regional pricing](https://www.alibabacloud.com/help/en/model-studio/qwen3-8-max)
- [Qwen3.8 weights](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)

Caveats: hosted Qwen3.8-Max adds vision, non-thinking mode, 1M context and
built-in tools on top of the released checkpoint — label the cost
comparison "hosted Qwen3.8-Max," not raw self-hosted weights. This also
resolves research 03's earlier caveat: the open checkpoint now exists
(HF, Aug 8), so Qwen3.8 MAY be called open-weight going forward.
