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
//   especially from the pres note in the bencorp repo — but do not invent
//   slide content. Draft wording gets a "Ben to pass" note.
// - Progressive disclosure: the default layer is felt, every technical layer
//   is opt-in (a later slide, the appendix, a question from the room).
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

  // The answer, in two dynamics, each landing on the AI ground it is about:
  // the analogy row primes, the closed-AI-vs-open-weights row pays off.
  // First: dependence — need is what they upcharge.
  "dynamic-dependence": (
    <PresentationSlide note="TODO: wording draft, Ben to pass.">
      <SlideStack align="start">
        <SlideKicker>Dynamic 1 · dependence</SlideKicker>
        <h2>The more you need it, the more they can upcharge you</h2>
        <SlideColumns>
          <SlideColumn label="A latte">
            <SlideStatement>Price doubles? You skip it.</SlideStatement>
          </SlideColumn>
          <SlideColumn label="Your heart medication" tone="accent">
            <SlideStatement>Price doubles? You pay.</SlideStatement>
          </SlideColumn>
        </SlideColumns>
        <SlideColumns>
          <SlideColumn label="Closed AI" tone="accent">
            <p className="!mt-0">
              Your work, your business, your questions already run on their
              model. They set the rent.
            </p>
          </SlideColumn>
          <SlideColumn label="Open weights">
            <p className="!mt-0">Your model. There is no rent to raise.</p>
          </SlideColumn>
        </SlideColumns>
      </SlideStack>
    </PresentationSlide>
  ),

  // Second: the missing door — no substitutes, and exits held hostage. Open
  // weights are the answer: the substitute that reopens the door.
  "dynamic-no-substitutes": (
    <PresentationSlide note="TODO: wording draft, Ben to pass — examples especially.">
      <SlideStack align="start">
        <SlideKicker>Dynamic 2 · no substitutes, switching costs</SlideKicker>
        <h2>And when you look for the door, there isn&rsquo;t one</h2>
        <SlideColumns>
          <SlideColumn label="No substitute" tone="accent">
            <SlideStatement>The taxis Uber undercut are gone.</SlideStatement>
          </SlideColumn>
          <SlideColumn label="Switching costs" tone="accent">
            <SlideStatement>Your friends and history stay behind.</SlideStatement>
          </SlideColumn>
        </SlideColumns>
        <SlideColumns>
          <SlideColumn label="Closed AI" tone="accent">
            <p className="!mt-0">
              Your chats, your memory, your workflows — all living in their
              cloud.
            </p>
          </SlideColumn>
          <SlideColumn label="Open weights">
            <p className="!mt-0">
              A drop-in substitute. Walking away costs nothing.
            </p>
          </SlideColumn>
        </SlideColumns>
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
    <PresentationSlide layout="center" note="TODO: fig 07 (exploded vest schematic) requested, not yet generated — slide becomes layout fill when art lands. Quote needs a source Ben has read — candidate: klim.com/Ai-1-Airbag-Vest-3046-000 (their FAQ, verified to contain the quote).">
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
