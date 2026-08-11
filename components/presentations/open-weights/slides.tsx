// loc-check: exempt — the slide bench is a registry that grows with the
// talk; the unit of review is the slide, not the file.
import { PresentationSlide } from "@/components/mdx/presentation";
import { closedProviders, ModelList, openProviders, sources, thesis } from "./data";
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

  // The generic chatbot pipeline, drawn live in the deck: a real prompt
  // through the model's internal representation to a real response. Code-
  // native like the timelines, so the example text stays editable and crisp.
  "fig-how-chatbots-work": (
    <PresentationSlide layout="center" note="TODO: this code-native diagram is a placeholder — fig 09 (gen art, square weight matrix in the model box) replaces it when Ben's upscale pipeline delivers. Example prompt and response are draft, Ben to pass.">
      <div className="flex w-full items-center justify-center gap-[max(0.9rem,2cqw)]">
        <div className="flex flex-col items-start gap-[0.6em]">
          <SlideKicker>Your prompt</SlideKicker>
          <p className="!mt-0 rounded-[max(0.4rem,0.9cqw)] border border-(--pres-rule) px-[1em] py-[0.7em] !text-[max(0.75rem,1.5cqw)] !text-(--pres-ink)">
            &ldquo;Why is the sky blue?&rdquo;
          </p>
        </div>
        <div className="flex flex-col items-center gap-[0.5em] text-(--pres-annotation)">
          <svg
            aria-hidden="true"
            className="h-[max(0.5rem,1cqw)] w-[max(1.8rem,3.6cqw)]"
            fill="none"
            viewBox="0 0 40 10"
          >
            <path d="M0 5 H34 M30 1 L35 5 L30 9" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="font-(family-name:--font-presentation-mono) text-[max(0.5rem,0.75cqw)] tracking-[0.09em] uppercase">
            Tokenization
          </span>
          <span className="font-(family-name:--font-presentation-mono) text-[max(0.5rem,0.8cqw)]">
            [3446, 318, &hellip;]
          </span>
        </div>
        <div className="flex flex-col items-center gap-[0.6em]">
          <SlideKicker>The model</SlideKicker>
          <div className="rounded-[max(0.4rem,0.9cqw)] border border-(--pres-annotation) px-[1.2em] py-[1em] text-center">
            <div className="grid grid-cols-4 gap-x-[1.1em] gap-y-[0.35em] font-(family-name:--font-presentation-mono) text-[max(0.58rem,1cqw)] text-(--pres-annotation)">
              <span>0.12</span><span>-1.40</span><span>0.87</span><span>&hellip;</span>
              <span>-0.53</span><span>2.01</span><span>-0.09</span><span>&hellip;</span>
              <span>1.76</span><span>-0.31</span><span>0.44</span><span>&hellip;</span>
              <span>&#8942;</span><span>&#8942;</span><span>&#8942;</span><span>&#8945;</span>
            </div>
            <p className="!mt-[0.6em] !max-w-none font-(family-name:--font-presentation-mono) !text-[max(0.5rem,0.75cqw)] tracking-[0.09em] uppercase !text-(--pres-ink-muted)">
              Math on the weights
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[0.5em] text-(--pres-annotation)">
          <svg
            aria-hidden="true"
            className="h-[max(0.5rem,1cqw)] w-[max(1.8rem,3.6cqw)]"
            fill="none"
            viewBox="0 0 40 10"
          >
            <path d="M0 5 H34 M30 1 L35 5 L30 9" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="font-(family-name:--font-presentation-mono) text-[max(0.5rem,0.75cqw)] tracking-[0.09em] uppercase">
            Decoding
          </span>
        </div>
        <div className="flex flex-col items-start gap-[0.6em]">
          <SlideKicker>Response</SlideKicker>
          <p className="!mt-0 max-w-[24ch] rounded-[max(0.4rem,0.9cqw)] border border-(--pres-rule) px-[1em] py-[0.7em] !text-[max(0.75rem,1.5cqw)] !text-(--pres-ink)">
            &ldquo;Sunlight scatters in the air &mdash; blue scatters
            most.&rdquo;
          </p>
        </div>
      </div>
    </PresentationSlide>
  ),

  "fig-enshittification-vs-appreciation": (
    <PresentationSlide
      layout="fill"
      note="TODO: placeholder version — chosen variant (common-start fork) needs its refinement: the closed curve's early honeymoon rise is too shallow. Revision logged in image request 06."
    >
      <SlideFigure
        alt="One curve leaves the origin, forks: open technology appreciates in your hands, closed technology enshittifies, with the gap labelled as what owning it is worth."
        caption="Fig. 06. Enshittification vs appreciation"
        frame={false}
        src="/images/blog/open-weights-ai-models/06-enshittification-vs-appreciation.png"
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

  // Spoken argument (with airbag): you don't really own it.
  "receipt-bed": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. Price claim needs a source Ben has read — candidate: Eight Sleep's own Autopilot pricing page. The AWS-outage story (stuck upright, overheating) is reserved for the dependence act; coverage candidates: NYT Oct 24 2025, PCMag.">
      <SlideStack gap="none">
        <SlideKicker>Your bed</SlideKicker>
        <SlideStatement>A $3,300 smart mattress</SlideStatement>
        <SlideArrow label="Then" />
        <SlideStatement size="lead">
          Comfort: $199 a year
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "when-open-tech-goes-right": (
    <PresentationSlide layout="center" note="TODO: benched, not in the setlist. Ben to choose its receipts (candidates from the convo: MP3s, email, the web, llama.cpp making the same file faster, the DeepSeek-Flash effect) and where it lands.">
      <SlideStack>
        <h2>When open tech goes right</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  // The bonus receipt, framed as an aside so its absurdity lands on its own.
  "the-airbag": (
    <PresentationSlide layout="center" note="TODO: quote needs a source Ben has read — candidate: klim.com/Ai-1-Airbag-Vest-3046-000 (their FAQ, verified to contain the quote).">
      <SlideStack>
        <SlideKicker>Bonus: you don&rsquo;t own your hardware either</SlideKicker>
        <SlideStatement size="lead">
          A motorcycle airbag that stops protecting you.
        </SlideStatement>
        <SlideStatement>
          &ldquo;After the 30-day grace period, the airbag will stop detecting
          crashes until payment is resumed.&rdquo;
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // Spoken argument: the cycle behind every receipt — subsidized prices train
  // the habit, dependence makes demand inelastic, then extraction begins.
  // Same axis drawing as the Uber and Instagram receipts, with the arc
  // barely begun: that visual rhyme is the argument.
  "hook-ai-next": (
    <PresentationSlide note="TODO: wording draft, Ben to pass — especially the future marks (IPO hinge, the accented end state). Early-signs examples (ChatGPT ads, 4o deprecation, personality changes) live in the spoken track.">
      <SlideStack align="start">
        <SlideKicker>Closed-source AI</SlideKicker>
        <h2>AI is at the $10-Uber stage.</h2>
        <SlideTimeline
          start={2022}
          end={2030}
          marks={[
            { at: 2022.9, yearLabel: "2022", sublabel: "ChatGPT", tone: "ink" },
            {
              at: 2025.6,
              yearLabel: "Now — we are here",
              label: "Free, or $20",
              sublabel: "Pre-IPO · subsidized growth"
            },
            { at: 2027.6, yearLabel: "Soon · IPO?" },
            {
              at: 2029.6,
              yearLabel: "Then",
              label: "?",
              sublabel: "Profit-maxxing · monopoly",
              tone: "accent"
            }
          ]}
        />
      </SlideStack>
    </PresentationSlide>
  ),

  "hook-the-door": (
    <PresentationSlide layout="center" note="TODO: the slide after this must answer 'what file?' — the what act is not written yet, the old body currently follows.">
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
