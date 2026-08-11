// loc-check: exempt — the slide bench is a registry that grows with the
// talk; the unit of review is the slide, not the file.
import { PresentationSlide } from "@/components/mdx/presentation";
import { closedProviders, ModelList, openProviders, sources } from "./data";
import {
  SlideArrow,
  SlideColumn,
  SlideColumns,
  SlideFigure,
  SlideKicker,
  SlideNotes,
  SlideRef,
  SlideStack,
  SlideStatement,
  SlideTerm,
  SlideTimeline
} from "@/components/mdx/presentation-parts";

// The bench: every slide the talk has in play, defined once and keyed by name.
// A setlist in index.tsx picks and orders slides from here, so reordering the
// talk or benching a slide never touches the slide itself. The bench is for
// slides in play — current setlists, the appendix, or material awaiting a
// restructure. Slides retired for good die in git history, not here.
//
// Authoring rules for this deck (Ben's):
// - Content is Ben's. Agents suggest, challenge, and develop his ideas —
//   especially from docs/presentations/open-weights/notes.md — but do not invent
//   slide content. Draft wording gets a "Ben to pass" note. Never scaffold:
//   a slide awaiting content or art stays intentionally empty.
// - Progressive disclosure: the default layer is felt, every technical layer
//   is opt-in (a later slide, the appendix, a question from the room).
// - Bridge, don't lecture: every concept starts from ground the audience
//   already stands on (ChatGPT, their feed, their ride) and walks to ours.
// - Every abstract claim carries its concrete example — on the slide, or in
//   Ben's spoken track. An unpaired abstraction is a draft.
// - Slide notes (the note prop, toggled with N) are internal change-tracking
//   only: what the slide still needs. Not speaker notes.
// - No source enters data.tsx unless Ben has read it. Agents verify claims
//   and park candidate links in the slide's note; Ben promotes them.
// - Flow: draft first, substantiate after. Slides land fast in Ben's words;
//   sources and figures follow through research-requests/ and image-requests/,
//   with each slide's note tracking what it still owes.
export const slides = {
  "title": (
    <PresentationSlide layout="center">
      <SlideStack gap="tight">
        <h1>Open Weight Models</h1>
        <SlideStatement>The $10 Uber you get to keep forever.</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The hook act. Name the closed-vs-open axis, show closed tech going wrong
  // with squeezes the audience has lived, place AI at the early stage of the
  // same cycle, then reveal the exit no earlier squeeze had. The talk's
  // promise is set by the end of "hook-the-door".
  "closed-vs-open-tech": (
    <PresentationSlide>
      <SlideStack align="start">
        <h2>Closed vs open technology</h2>
        <SlideColumns>
          <SlideColumn label="Closed, aka enshittification" tone="accent">
            <ul>
              <li>Optimized for revenue, via your retention and dependence</li>
              <li>Innovations go to their margins</li>
              <li>Your data goes to deepening your dependence</li>
            </ul>
          </SlideColumn>
          <SlideColumn label="Open, aka appreciation">
            <ul>
              <li>Community improvements benefit everyone</li>
              <li>You configure and improve it freely</li>
              <li>No one can revoke it</li>
            </ul>
          </SlideColumn>
        </SlideColumns>
      </SlideStack>
    </PresentationSlide>
  ),

  // The ten-second definition, so "open weights" parses everywhere after.
  // The deep what-act (model landscape, weights, figures) stays after the
  // door slide, where its job is belief, not definition.
  "what-i-mean": (
    <PresentationSlide note="TODO: wording draft, Ben to pass.">
      <SlideStack align="start">
        <h2>How do chatbots work?</h2>
        <ul>
          <li>
            Chatbots like ChatGPT or Claude are Large Language Models{" "}
            <SlideTerm>LLMs</SlideTerm>
          </li>
          <li>
            LLMs are machine learning <SlideTerm>ML</SlideTerm> models that
            take text in and produce text out
          </li>
          <li>
            They do this by turning your text into numbers{" "}
            <SlideTerm>tokenization</SlideTerm>, doing math{" "}
            <SlideTerm>matrix multiplication</SlideTerm>, then turning the
            numbers back into text <SlideTerm>decoding</SlideTerm>
          </li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  // The generic chatbot pipeline, kept deliberately human-scale: one familiar
  // request, the weights in the middle, and one useful response.
  "fig-how-chatbots-work": (
    <PresentationSlide layout="fill">
      <SlideFigure
        alt="A request to ChatGPT passes through the model weights and becomes a concise email draft."
        caption="Fig. 09. How a chatbot works"
        frame={false}
        src="/images/blog/open-weights-ai-models/09-how-chatbots-work.png"
      />
    </PresentationSlide>
  ),

  // The definition drawn: the identical pipeline twice, and the only
  // difference between closed and open is whose computer the weights sit on.
  "fig-the-file-locked-vs-free": (
    <PresentationSlide layout="fill">
      <SlideFigure
        alt="The same prompt-to-response pipeline twice: the weights caged in OpenAI's computer behind a gate marked their rules their prices, and the same file open on your laptop."
        caption="Fig. 08. The same file, two computers"
        frame={false}
        src="/images/blog/open-weights-ai-models/08-the-file-locked-vs-free.png"
      />
    </PresentationSlide>
  ),

  // When closed tech goes wrong: a section marker, then one receipt per
  // slide, quick-fire, ending on the airbag as the peak. The mirror section
  // ("when-open-tech-goes-right") is benched until Ben places its receipts.
  "when-closed-tech-goes-wrong": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack>
        <h2>When closed tech goes wrong</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  // Spoken argument: price elasticity, seeded here and paid off on the
  // price-elasticity slide after the Instagram receipt.
  "receipt-uber": (
    <PresentationSlide note="TODO: wording draft, Ben to pass. Replace the now-line with Ben's own timestamped app screenshot (representative quote, not a same-route comparison) in public/images/blog/open-weights-ai-models/screenshots/. Sources for the era and the 45% aggregate are gathered in research-requests/01-uber-receipt.md — Ben to read before any get cited.">
      <SlideStack align="start">
        <SlideKicker>Uber</SlideKicker>
        <h2>Remember when the ride home from the concert was $10?</h2>
        <SlideTimeline
          start={2012}
          end={2027}
          marks={[
            {
              at: 2016,
              yearLabel: "2015–2017",
              label: "$10",
              sublabel: "Pre-IPO · subsidized growth"
            },
            { at: 2019.4, yearLabel: "2019", sublabel: "IPO", tone: "ink" },
            {
              at: 2026.5,
              yearLabel: "Now",
              label: "$70 + surge",
              sublabel: "Public · profit-maxxing · monopoly",
              tone: "accent"
            }
          ]}
        />
      </SlideStack>
    </PresentationSlide>
  ),

  // Spoken argument: Meta's failures — what retention optimization did to
  // the feed, and where that same playbook goes next.
  "receipt-instagram": (
    <PresentationSlide note="TODO: wording draft, Ben to pass. Dates are from memory — research-requests/02-instagram-receipt.md is out to verify them and mine the Doctorow TikTok piece (uncited until Ben reads it).">
      <SlideStack align="start">
        <SlideKicker>Instagram</SlideKicker>
        <h2>Remember when Instagram was just your friends?</h2>
        <SlideTimeline
          start={2010}
          end={2027}
          marks={[
            {
              at: 2012.5,
              yearLabel: "2010–2015",
              label: "Your friends, in order",
              sublabel: "Chronological feed"
            },
            { at: 2016, yearLabel: "2016", sublabel: "Algorithmic feed", tone: "ink" },
            { at: 2020, yearLabel: "2020", sublabel: "Reels", tone: "ink" },
            {
              at: 2026.5,
              yearLabel: "Now",
              label: "An ad machine",
              sublabel: "Ads · engagement-maxxing",
              tone: "accent"
            }
          ]}
        />
      </SlideStack>
    </PresentationSlide>
  ),

  // The section question: after two completed arcs, ask it straight. The
  // elasticity slide answers it.
  "why-do-we-put-up": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack>
        <h2>Why do we put up with this?</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  // The answer, in two dynamics. Titles are Ben's; bodies await his content.
  "dynamic-dependence": (
    <PresentationSlide note="TODO: body is empty — Ben to write it. Killed draft: latte/heart-med columns + closed-AI-vs-open-weights row (in git history if wanted).">
      <SlideStack align="start">
        <SlideKicker>Dynamic 1 · dependence</SlideKicker>
        <h2>The more you need it, the more they can upcharge you</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "dynamic-no-substitutes": (
    <PresentationSlide note="TODO: body is empty — Ben to write it. Killed draft: taxis/switching-costs columns + closed-AI-vs-open-weights row (in git history if wanted).">
      <SlideStack align="start">
        <SlideKicker>Dynamic 2 · no substitutes, switching costs</SlideKicker>
        <h2>And when you look for the door, there isn&rsquo;t one</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "receipt-fridge": (
    <PresentationSlide layout="center" note="TODO: benched — Ben's receipt lineup is uber/instagram/bed/airbag. Restore under you-don't-own-it or retire. If restored, needs a source Ben has read — candidate: Ars Technica, Oct 2025, samsung-makes-ads-on-3499-smart-fridges-official.">
      <SlideStack gap="none">
        <SlideKicker>Your fridge</SlideKicker>
        <SlideStatement>A $3,499 smart fridge</SlideStatement>
        <SlideArrow label="Then" />
        <SlideStatement size="lead">
          Ads, by software update
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "when-open-tech-goes-right": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. Receipts drafted from his candidates: MP3s and community speed; email/the web remain spares.">
      <SlideStack>
        <h2>When open tech goes right</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  // The bonus receipt, framed as an aside so its absurdity lands on its own.
  "the-airbag": (
    <PresentationSlide layout="fill" note="TODO: wording draft, Ben to pass. Citation added at Ben's direction — he should skim the Klim page before Wednesday.">
      <div className="flex h-full min-h-0 items-center justify-center gap-[max(1.2rem,3cqw)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="The Klim Ai-1 airbag vest, the product whose crash detection pauses for nonpayment."
          className="h-[70%] w-auto min-h-0 rounded-[max(0.4rem,0.9cqw)] border border-(--pres-rule) object-contain"
          src="/images/blog/open-weights-ai-models/screenshots/klim-ai-1-vest.avif"
        />
        <SlideStack align="start" gap="tight">
          <SlideKicker>Bonus: you don&rsquo;t own your hardware either</SlideKicker>
          <SlideStatement size="lead">
            A subscription airbag that stops protecting you.
          </SlideStatement>
          <SlideStatement>
            &ldquo;After the 30-day grace period, the airbag will stop
            detecting crashes until payment is resumed.&rdquo;
            <SlideRef n={2} />
          </SlideStatement>
        </SlideStack>
      </div>
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

  // ---- After the door: when open tech goes right (the mirror receipts),
  // the felt-four why, the landscape, the how ladder, and the close. All
  // drafted from Ben's conversation; every slide awaits his pass.

  "receipt-mp3": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. Ben's candidates for this section also include email and the web.">
      <SlideStack gap="none">
        <SlideKicker>Your MP3s</SlideKicker>
        <SlideStatement>Bought in 2003</SlideStatement>
        <SlideArrow label="Still" />
        <SlideStatement size="lead">Play everywhere, forever, free</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // Why open weights: a section marker, then one benefit per slide, each
  // paired with its felt example from Ben's material. All await his pass.
  "why-open-weights": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack>
        <h2>Why open weights?</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-refuse": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. Spare examples for the spoken track: the meme with a friend's face, malware crafted to trip classifiers so no frontier model will help remove it, soft refusals that hurt research.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">It won&rsquo;t refuse you</SlideStatement>
        <SlideStatement>
          Ask the medical question. It just answers.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-privacy": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">It won&rsquo;t sell your chats</SlideStatement>
        <SlideStatement>
          Your 2am conversation is not training data.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-price": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">It won&rsquo;t price gouge you</SlideStatement>
        <SlideStatement>
          No &ldquo;you&rsquo;ve hit your limit &mdash; upgrade to
          Pro.&rdquo;
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-forever": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. The 4o line may need a beat of setup for anyone who missed the story.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">It can&rsquo;t be taken from you</SlideStatement>
        <SlideStatement>
          When 4o died, thousands grieved. Nobody with the file lost a thing.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-community": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. The DeepSeek-Flash effect / llama.cpp beat: the same file gets faster because thousands of people optimize it.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">Community improvements come straight to you</SlideStatement>
        <SlideStatement>
          The file you downloaded runs faster every month &mdash; and you pay
          no one.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-custom": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. Ben's example: a model tuned to elicit your creativity, not do your work; any model from any lab, swapped freely.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">It can be exactly yours</SlideStatement>
        <SlideStatement>
          Tuned to your domain and your values &mdash; not the average
          user&rsquo;s.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "speed-demo": (
    <PresentationSlide layout="center" note="TODO: live demo cue — model streaming at high tok/s, wifi visibly off. Slide stays minimal; the demo is the content. Ben to decide the exact rig.">
      <SlideStack>
        <SlideStatement size="lead">And it&rsquo;s fast.</SlideStatement>
        <SlideKicker>Live: laptop, airplane mode</SlideKicker>
      </SlideStack>
    </PresentationSlide>
  ),

  // The how act: the ladder from the audience-tiers conversation. One path
  // per tier, zero decisions on the default path.
  "how-do-you-start": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack>
        <h2>How do you start?</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-everyone": (
    <PresentationSlide note="TODO: wording draft and the exact recommended model, Ben to pass. One path, zero decisions.">
      <SlideStack align="start">
        <SlideKicker>Everyone</SlideKicker>
        <h2>Ten minutes, tonight</h2>
        <ul>
          <li>Download LM Studio</li>
          <li>Pick the model it recommends for your machine</li>
          <li>Turn the wifi off and talk to it</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-coders": (
    <PresentationSlide note="TODO: wording draft, Ben to pass — his exact recommended provider/model pairing.">
      <SlideStack align="start">
        <SlideKicker>You use a coding agent</SlideKicker>
        <h2>Same tools, open weights behind them</h2>
        <ul>
          <li>Point your agent at an open model via OpenRouter</li>
          <li>Fraction of the cost, sometimes faster than what you pay for</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-the-rabbit-hole": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. This is the door to the technical appendix — engines, cloud GPUs, finetuning — and the blog post.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">The rabbit hole is right there.</SlideStatement>
        <SlideKicker>Engines &middot; cloud GPUs &middot; finetuning &middot; ask me anything</SlideKicker>
      </SlideStack>
    </PresentationSlide>
  ),

  // The close: the title card's promise, kept.
  "own-the-weights": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">Own the weights.</SlideStatement>
        <SlideStatement>The $10 Uber you get to keep forever.</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // Appendix marker: everything past this slide is the technical door,
  // reached only on purpose.
  "appendix": (
    <PresentationSlide layout="center">
      <SlideStack>
        <h2>Appendix</h2>
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
