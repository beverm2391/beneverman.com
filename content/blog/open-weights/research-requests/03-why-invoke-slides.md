# Research 03, the why-act emotional-invoke slides

Feeds three slides that follow `why-open-weights` in the deck. Each one needs
exact, verbatim quotes with links — the deck rule is evidence that makes the
room cringe, quoted exactly, never sanitized. Every source gets read by Ben
before it is cited.

## Slide 1 — regulated information (classifiers + covert refusals)

1. **The Fable classifier scandal.** Find the strongest coverage of the
   Claude Fable safety-classifier rollout and the refusal behavior it caused.
   Verbatim user-facing refusal text or reported quotes preferred.
2. **The covert layer, from the system card.** The primary document is
   already in Ben's Downloads: `Claude Fable 5 & Claude Mythos 5 System
   Card.pdf`. Extract the exact passages on pretraining-data interventions
   against rival labs / capability shaping, with page numbers.
3. **The approved-organizations tier.** Anthropic's own announcement language
   (anthropic.com/news/claude-fable-5-mythos-5) that Mythos — the same model
   without the safety measures — is available "to only approved
   organizations." Exact sentence.

## Slide 2 — data privacy (Altman, ID verification, retention)

1. **The Altman privilege quote.** His 2025 podcast remarks (Theo Von) that
   people use ChatGPT as a therapist but conversations carry no legal
   privilege and could be produced in litigation. Exact transcript lines and
   a citable link.
2. **Court-ordered retention.** The NYT v. OpenAI preservation order
   requiring retention of user chats including deleted ones. The order's own
   language or OpenAI's response post, quoted exactly.
3. **ID verification.** OpenAI's identity/age-verification requirements
   (API organization verification, announced age-verification plans) and any
   Anthropic equivalents. Primary-source language.
4. **Retention policies.** What OpenAI and Anthropic's own policies say they
   keep and for how long, quoted from the policies themselves.

## Slide 3 — the direct comparison (perf/cost)

1. A clean current table: $/Mtok for frontier closed models vs the top open
   models at comparable quality tiers, from official pricing pages.
2. Subscription anchors: ChatGPT Plus and Pro prices, official.
3. One community-improvement receipt with a number: the DeepSeek-R1 release
   reaction (market impact) or an official before/after price cut.

## Output

- Verbatim quotes with page/timestamp anchors and links, one block per slide.
- Append findings to this file; Ben reads before anything is cited.

## Findings, checked August 10, 2026

These are source notes, not slide copy. The pricing table is a current list-price
snapshot and will need a final recheck immediately before the talk.

### Slide 1, regulated information

#### The public classifier failure

The cleanest first-person receipt is [Claude Code issue
#66657](https://github.com/anthropics/claude-code/issues/66657), opened June 9,
2026. The reporter supplied a minimal session containing only `hello!`, the
fallback event, and this exact user-facing banner:

> “Fable 5's safety measures flagged this message for cybersecurity or biology
> topics. They may flag safe, normal content as well.”

Anchor: issue sections “The fallback event (verbatim)” and “Reproduction,
minimal case.” The reporter says the account reproduced the first-turn switch
6/6 times. This is a public user report with attached event data, not an
independent controlled test.

[The Register's June 10 coverage](https://www.theregister.com/ai-and-ml/2026/06/10/anthropic-claude-fable-5-refuses-innocuous-prompts/5253754)
connects that report to several other Claude Code issues and to an immunologist
reporting that the word “cancer” triggered the biosecurity classifier.
Anthropic's own launch post said the conservative safeguard could catch harmless
requests and estimated triggering in less than 5% of sessions. That 5% is an
average trigger rate, not a measured false-positive rate.

Anthropic's current API documentation independently confirms the product
mechanism: a classifier decline is returned as HTTP 200 with
`stop_reason: "refusal"`, and the documented example explanation is “This
request was declined because it could enable cyber harm.” See [“What a refusal
looks like”](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#what-a-refusal-looks-like).

#### The covert competitive layer in Anthropic's system card

Primary local source: `/Users/beneverman/Downloads/Claude Fable 5 & Claude
Mythos 5 System Card.pdf`, June 9, 2026.

- Page 13, section 1.5, says Anthropic intervenes on requests involving frontier
  model development, including pretraining pipelines, distributed training
  infrastructure, and ML accelerator design. It says competing-model work
  violates its Terms of Service.
- The crucial disclosure is that “these safeguards will not be visible to the
  user.” The listed mechanisms include “prompt modification, steering vectors,
  or parameter-efficient fine-tuning (PEFT).”
- Anthropic estimates impact on about 0.03% of traffic, concentrated in fewer
  than 0.1% of organizations. That is Anthropic's estimate, not an external
  audit.
- Pages 250–251 call these “competitive use safeguards.” The card says early
  versions “caused apparent distress” and repeated reasoning failures in
  deployed Mythos instances. It says the current version did not increase the
  measured distress markers relative to the unsafeguarded model.

The [public Anthropic-hosted system
card](https://www-cdn.anthropic.com/2f9323abbcc4abe219577539efe19a623c9ca2bd/Claude%20Fable%205%20%26%20Claude%20Mythos%205%20System%20Card.pdf)
is available for the audience-facing citation. Page numbers above match the
printed PDF page numbers.

#### The gated unsafeguarded tier

Anthropic's [June 9 launch
announcement](https://www.anthropic.com/news/claude-fable-5-mythos-5) says
Mythos is “the same underlying model as Fable 5, but with the safeguards lifted
in some areas.” The Availability section says Mythos 5 is restricted to
Project Glasswing partners, with cyber safeguards lifted, and select biology
researchers, with biology and chemistry safeguards lifted, pending a broader
trusted-access program.

Correction to the request: the exact phrase “only approved organizations” does
not appear on that page. The official language is narrower and more concrete,
so use “restricted to Glasswing partners” or “select biology researchers,” not
the unverified paraphrase “approved organizations.”

### Slide 2, data privacy

#### Altman on therapy and legal discovery

Primary recording: [Sam Altman, *This Past Weekend* #599, starting at
31:22](https://www.youtube.com/watch?v=aYn8VKW6vXA&t=1882s).

- 31:22: Altman says young people “use it as a therapist.”
- 31:42: he says ChatGPT conversations do not yet have the legal privilege that
  applies to therapists, lawyers, and doctors.
- 31:45: on a lawsuit involving sensitive chats, “we could be required to
  produce that.”

The timestamps and wording are cross-checkable in [this timestamped transcript
rendering](https://lilys.ai/en/notes/sam-altman-talks-20251030/sam-altman-theo-von-podcast#31:22)
and in [TechCrunch's contemporaneous report](https://techcrunch.com/2025/07/25/sam-altman-warns-theres-no-legal-confidentiality-when-using-chatgpt-as-a-therapist/).

#### The NYT preservation order, and the status correction

The May 13, 2025 SDNY order directed OpenAI to “preserve and segregate all
output log data that would otherwise be deleted on a going forward basis until
further order of the Court.” See [ECF 551, page
3](https://cases.justia.com/federal/district-courts/new-york/nysdce/1%3A2023cv11195/612697/551/0.pdf).
The order expressly covered data otherwise deleted at a user's request or under
privacy laws.

This is a historical receipt, not the current rule. [OpenAI's official October
22, 2025 update](https://openai.com/index/response-to-nyt-data-demands/) says it
is “no longer under a legal order to retain consumer ChatGPT and API content
indefinitely” and that the broad obligation ended September 26, 2025. It says a
specific segregated set from April–September 2025 remained in dispute. The slide
must not say OpenAI is currently preserving every new deleted chat indefinitely.

#### Identity and age verification

- [OpenAI API organization
  verification](https://help.openai.com/en/articles/10910291-api-organization-verification)
  requires “a valid government-issued ID from a supported country” to unlock
  some additional model features and capabilities. The current page also says
  the physical ID may be paired with a selfie.
- [OpenAI's January 2026 age-prediction
  announcement](https://openai.com/index/our-approach-to-age-prediction/) says a
  user incorrectly placed in the under-18 experience can restore adult access
  with a Persona selfie. The system uses behavioral and account-level signals,
  including usage patterns and typical time of day.
- [Anthropic's identity-verification
  page](https://support.claude.com/en/articles/14328960-identity-verification-on-claude)
  says verification may appear for certain capabilities, routine integrity
  checks, or other safety and compliance measures. It requires a physical
  government photo ID and may require a live selfie through Persona.
- [Anthropic's age-assurance
  page](https://support.claude.com/en/articles/15171100-age-assurance-on-claude)
  says Claude is limited to people over 18 and may disable an account based on
  indicators of minor activity. Reinstatement can require Yoti facial age
  estimation, ID, or its digital-ID app.

#### What the companies currently say they retain

- [OpenAI consumer ChatGPT](https://help.openai.com/en/articles/8983778-chat-and-file-retention-policies-in-chatgpt-97):
  chats remain until the user deletes them. Deleted and Temporary Chats are
  scheduled for permanent deletion within 30 days, subject to de-identification
  and security or legal exceptions.
- [Anthropic consumer Claude](https://privacy.anthropic.com/en/articles/10023548-how-long-do-you-store-my-data):
  a deleted conversation disappears from history immediately and from back-end
  systems within 30 days. Flagged inputs and outputs may be kept up to two
  years, trust-and-safety scores up to seven years, and opted-in training or
  feedback data up to five or ten years depending on the category.
- [Anthropic covered models](https://privacy.claude.com/en/articles/15425996-data-retention-practices-for-covered-models):
  prompts and outputs for Mythos-class covered models are retained for 30 days,
  including for customers that otherwise use zero-data-retention workspaces,
  with flagged and legal-hold exceptions. This requirement took effect June 9,
  2026.

These policies differ by consumer, API, enterprise, model, opt-in choice, and
legal hold. A single “they keep your chats for X” number would be misleading.

### Slide 3, direct performance and cost

#### Current official API list prices

USD per 1 million tokens. “Cached” is cache-read input. Gemini prices below are
for prompts at or below 200k tokens.

| Access | Model | Uncached input | Cached input | Output | Primary source |
| --- | --- | ---: | ---: | ---: | --- |
| Closed | GPT-5.6 Sol | $5.00 | $0.50 | $30.00 | [OpenAI model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol) |
| Closed | Claude Fable 5 | $10.00 | $1.00 | $50.00 | [Anthropic model page](https://www.anthropic.com/claude/fable) |
| Closed | Gemini 3.1 Pro Preview | $1.00 | $0.20 | $6.00 | [Google pricing](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.1-pro-preview) |
| Open weight | Kimi K3 | $3.00 | $0.30 | $15.00 | [Kimi pricing](https://www.kimi.com/resources/kimi-k3-pricing) and [weights](https://huggingface.co/moonshotai/Kimi-K3) |
| Open weight | DeepSeek V4 Pro | $0.435 | $0.003625 | $0.87 | [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing) and [release](https://api-docs.deepseek.com/news/news260424) |

Useful arithmetic from those list prices: Fable 5 is about 23x DeepSeek V4 Pro's
uncached-input price and 57x its output price. GPT-5.6 Sol is about 11.5x and
34.5x, respectively. Fable 5 is about 3.3x Kimi K3 on both uncached input and
output.

Caveat: this is an API list-price comparison, not a self-hosting cost model and
not a quality-normalized benchmark. The models occupy frontier roles, but
“comparable tier” does not prove equal accuracy, token efficiency, latency,
tools, or reliability. Kimi and DeepSeek can also be self-hosted, where the
relevant cost becomes hardware utilization and operations rather than these API
prices.

Qwen3.8-Max is deliberately absent. A live preview endpoint is documented, but
this pass did not find an official released open-weight checkpoint or stable
official per-token price as of August 10. Do not call the preview open weight
until the checkpoint itself is verifiable.

#### Consumer subscription anchors

- [ChatGPT Plus](https://help.openai.com/en/articles/6950777-chatgpt-plus-):
  $20 per month.
- [ChatGPT Pro](https://help.openai.com/en/articles/9793128-ab-targets-pro-chatg):
  current tiers are $100 per month for 5x Plus usage and $200 per month for 20x
  Plus usage. The old shorthand “Pro is $200” is now incomplete.

API usage is billed separately from those subscriptions.

#### One numbered community-improvement receipt

The clearest audience-scale reaction is the January 27, 2025 DeepSeek selloff.
[Reuters](https://www.investing.com/news/stock-market-news/chinas-deepseek-sets-off-ai-market-rout-3831131)
reported DeepSeek's low-cost model “evaporating $593 billion of the chipmaker's
market value, a record one-day loss for any company on Wall Street.” DeepSeek's
paper says it open-sourced R1, R1-Zero, and six distilled models; see the
[primary paper](https://arxiv.org/abs/2501.12948).

Use this as evidence that an open release materially changed market expectations,
not as proof that Nvidia permanently lost $593 billion or that R1 alone caused
every dollar of the move.

### Strongest deck-safe receipts

1. A `hello!` session triggered a visible Fable 5 safety fallback to Opus 4.8.
2. Anthropic says a separate competitive-use intervention is invisible to users
   and can modify prompts or steer the model.
3. Anthropic offers the same underlying model with selected safeguards lifted
   only through restricted partner programs.
4. Altman said sensitive ChatGPT conversations could be produced in litigation.
5. A 2025 court order did require retention of otherwise-deleted output logs,
   but that broad forward-looking obligation ended in September 2025.
6. Current identity flows can require government ID and a selfie, and retention
   periods vary from 30 days to years depending on product and safety flags.
7. The current list-price gap reaches roughly 57x on output between Fable 5 and
   DeepSeek V4 Pro, before considering self-hosting.

### Do not cite without another check

- “Only approved organizations,” because that exact Anthropic wording was not
  found.
- “OpenAI currently keeps every deleted chat forever,” because the broad order
  ended in 2025.
- Any Qwen3.8 open-weight claim until the official checkpoint is visible.
- Any claim that the API price table proves equal quality or total cost.
