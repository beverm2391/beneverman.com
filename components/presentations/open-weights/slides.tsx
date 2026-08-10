import { PresentationSlide } from "@/components/mdx/presentation";
import { closedProviders, ModelList, openProviders, sources, thesis } from "./data";
import {
  SlideArrow,
  SlideBody,
  SlideColumn,
  SlideColumns,
  SlideFigure,
  SlideNotes,
  SlideRef,
  SlideStack,
  SlideStatement
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
// - Every abstract claim carries its concrete example — on the slide as a
//   quiet sub-line, or in the note as a mandatory spoken beat. An unpaired
//   abstraction is a draft.
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
    <PresentationSlide note="Assert the axis, don't prove it — the incentives act later carries the proof. Every line needs its spoken example: retention → ChatGPT RL'd toward follow-up questions; margins → inference got ~100x cheaper, your $20 didn't move; community → the DeepSeek-Flash effect, llama.cpp making your same file faster next year; revoke → the file on your laptop vs 4o deprecated overnight. Fig 06 (value curves over time) is requested for this beat. Wording is draft, Ben to pass.">
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

  "closed-tech-goes-wrong": (
    <PresentationSlide note="Escalation: your ride, your feed, your fridge, your bed. Ask who remembers $10 Ubers. The pattern has a name (ref 2) but do not lecture it. Backup receipt if asked: HP Dynamic Security firmware blocks non-HP ink that worked yesterday (hp.com/us-en/cartridge/supplies-security.html). The bed's AWS-outage story (stuck upright, overheating) is saved for the dependence act. Wording is draft, Ben to pass.">
      <SlideStack align="start">
        <h2>
          Closed tech goes wrong
          <SlideRef n={2} />
        </h2>
        <SlideColumns>
          <SlideColumn label="Uber">
            <p className="!mt-0">$10 across town</p>
            <p className="!text-(--pres-ink)">$70, plus surge</p>
          </SlideColumn>
          <SlideColumn label="Instagram">
            <p className="!mt-0">Your friends, eight years ago</p>
            <p className="!text-(--pres-ink)">An ad machine, now</p>
          </SlideColumn>
          <SlideColumn label="Your fridge">
            <p className="!mt-0">A $3,499 smart fridge</p>
            <p className="!text-(--pres-ink)">
              Ads, by software update
              <SlideRef n={4} />
            </p>
          </SlideColumn>
          <SlideColumn label="Your bed">
            <p className="!mt-0">A $3,300 smart mattress</p>
            <p className="!text-(--pres-ink)">
              Comfort: $199 a year
              <SlideRef n={5} />
            </p>
          </SlideColumn>
        </SlideColumns>
      </SlideStack>
    </PresentationSlide>
  ),

  "the-airbag": (
    <PresentationSlide layout="center" note="The peak receipt: not a squeeze, a kill switch on safety equipment. Read the quote slowly, it is Klim's own FAQ. Fig 07 requested to draw this slide.">
      <SlideStack>
        <SlideStatement size="lead">
          A motorcycle airbag that stops protecting you.
        </SlideStatement>
        <SlideStatement>
          &ldquo;After the 30-day grace period, the airbag will stop detecting
          crashes until payment is resumed.&rdquo;
          <SlideRef n={3} />
        </SlideStatement>
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
