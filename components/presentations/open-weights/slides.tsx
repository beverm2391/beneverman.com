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
// talk or benching a slide never touches the slide itself. Cut slides stay on
// the bench (Ben's call: save everything) — only exact duplicates of live
// material die into git history.
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
// - Evidence exists to make the room cringe. Pick the most visceral
//   defensible fact and quote it exactly, at length — a long verbatim quote
//   beats a tight summary every time. Never compress a quote, never
//   sanitize it into an abstraction ("endangering children" is a fact;
//   what the algorithm did to children is the point).
// - Slide notes (the note prop, toggled with N) are internal change-tracking
//   only: what the slide still needs. Not speaker notes.
// - No source enters data.tsx unless Ben has read it. Agents verify claims
//   and park candidate links in the slide's note; Ben promotes them.
// - Flow: draft first, substantiate after. Slides land fast in Ben's words;
//   sources and figures follow through research-requests/ and image-requests/,
//   with each slide's note tracking what it still owes.
export const slides = {
  "title": (
    <PresentationSlide layout="center" note="TODO: spoken close can still cash the $10-Uber line from the Uber receipt.">
      <SlideStack gap="tight">
        <h1>Open Weight Models</h1>
        <SlideStatement>AI they can&rsquo;t use against you.</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The talk's first proof, straight from the CEO's mouth: the claim on the
  // title card, confirmed by the man who runs the biggest closed model.
  "altman-receipt": (
    <PresentationSlide layout="center" note="TODO: Ben to pass. One continuous quotation, ellipsis-joined, every fragment verbatim to the recording (This Past Weekend #599, 31:22-31:45, youtube.com/watch?v=aYn8VKW6vXA&t=1882s; TechCrunch ref 7 prints sh** — the recording says shit). Ben to read/watch before presenting.">
      <SlideStack gap="tight">
        <SlideKicker>Sam Altman, July 2025</SlideKicker>
        <SlideStatement size="lead">
          &ldquo;People talk about the most personal shit in their lives to
          ChatGPT&hellip; if you talk to a therapist or a lawyer or a doctor
          about those problems, there&rsquo;s legal privilege for
          it&hellip; we haven&rsquo;t figured that out yet for when you talk
          to ChatGPT&hellip; we could be required to produce that.&rdquo;
          <SlideRef n={7} />
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The dependence dynamic, confessed: intelligence sold like electricity —
  // the textbook inelastic utility — on their meter. Flood now (subsidized
  // era), meter forever. Sits directly after the dependence slide it proves.
  "altman-meter": (
    <PresentationSlide layout="center" note="TODO: Ben to pass. Both quotes verbatim from the C-SPAN transcript Ben supplied (ref 11), BlackRock Infrastructure Summit, March 2026.">
      <SlideStack gap="tight">
        <SlideKicker>Sam Altman, March 2026</SlideKicker>
        <SlideStatement>
          &ldquo;So the best thing to me throughout all the history of
          capitalism innovation, whatever you want, is to just flood the
          market.&rdquo;
        </SlideStatement>
        <SlideStatement size="lead">
          &ldquo;We see a future where intelligence is a utility like
          electricity or water, and people buy it from us on a meter and use
          it for whatever they want to use it for.&rdquo;
          <SlideRef n={11} />
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The map of the talk itself: breadth is the spine, depth is optional,
  // the room steers. Shown right after the title so the mechanic is a
  // promise: we only dig where you want to.
  "how-this-talk-works": (
    <PresentationSlide layout="fill">
      <div className="flex h-full min-h-0 flex-col items-center gap-[max(0.6rem,1.2cqw)]">
        <SlideFigure
          alt="A map of this talk: seven concepts left to right at equal scope, with optional dive stacks descending into technical depth under three of them."
          frame={false}
          src="/images/blog/open-weights-ai-models/10-how-this-talk-works.png"
        />
        <div className="text-center">
          <SlideStatement size="lead">
            Customize this presentation to your interests
          </SlideStatement>
        </div>
      </div>
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
    <PresentationSlide note="TODO: now dive 2a under the pipeline slide — the technical layer of how-chatbots-work, reached on demand.">
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
    <PresentationSlide note="TODO: wording draft, Ben to pass. sources.md has the upgrade path: dated hinges (2015 $10 fare campaign, 2016 upfront quote replacing the visible meter, 2019 S-1 disclosing rider/driver price decoupling, 2026 second-by-second repricing) and the Oct 2025 airport receipt ($44 on-property, $9 after walking off). Ben to read before citing; his own app screenshot still wanted.">
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

  // The drill behind the Uber model: one receipt, felt in the legs.
  "drill-uber-airport": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. From sources.md: Oct 2025 airport rider, $44 on-property vs $9 after walking ~20 minutes off; comments dispute perfect comparability, so present as the airport geofence, not manipulation proof. The reddit screenshots would substantiate — Ben to read the post and decide.">
      <SlideStack gap="none">
        <SlideKicker>Uber, right now</SlideKicker>
        <SlideStatement size="lead">
          The price knows when you&rsquo;re stranded.
        </SlideStatement>
        <SlideStatement>$44 at the airport curb.</SlideStatement>
        <SlideArrow label="Walk 20 min" />
        <SlideStatement size="lead">
          $9.
          <SlideRef n={3} />
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // Spoken argument: Meta's failures — what retention optimization did to
  // the feed, and where that same playbook goes next.
  "receipt-instagram": (
    <PresentationSlide note="TODO: wording draft, Ben to pass. Dates are from memory — research-requests/02-instagram-receipt.md is out to verify. Spoken-track ammo staged in sources.md: the New Mexico jury verdict against Meta ($942M, court finding not allegation) and the Facebook Papers engagement-ranking research.">
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

  // The drill behind the Instagram model: not an opinion, a verdict.
  "drill-meta-verdict": (
    <PresentationSlide note="TODO: Ben to pass. All lines verbatim from the NMDOJ verdict release (ref 4); the complaint (ref 6) and AP judgment total (ref 5) back the kicker. Ben to read all three before the blog.">
      <SlideStack align="start" gap="tight">
        <SlideKicker>
          New Mexico v. Meta, 2026 &mdash; jury verdict, $942 million
          <SlideRef n={4} />
          <SlideRef n={5} />
        </SlideKicker>
        <SlideStatement>
          The evidence at trial &ldquo;established that Meta&rsquo;s design
          features enabled pedophiles and predators to engage in child sexual
          exploitation on Meta&rsquo;s platforms.&rdquo;
        </SlideStatement>
        <SlideStatement>
          &ldquo;Meta intentionally designs its platforms to addict young
          people and, contrary to Meta&rsquo;s public commitments, expose
          them to dangerous content related to eating disorders and self
          harm.&rdquo;
        </SlideStatement>
        <SlideStatement>
          &ldquo;Meta executives knew their products harmed children,
          disregarded warnings from their own employees, and lied to the
          public about what they knew.&rdquo;
        </SlideStatement>
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
    <PresentationSlide layout="center" note="TODO: benched — the internet carries the open-goes-right section now.">
      <SlideStack gap="none">
        <SlideKicker>Your MP3s</SlideKicker>
        <SlideStatement>Bought in 2003</SlideStatement>
        <SlideArrow label="Still" />
        <SlideStatement size="lead">Play everywhere, forever, free</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The internet as the open-goes-right receipt: the one open technology
  // everyone in the room lives on.
  "receipt-internet": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. Spoken bullets from the pres note: what a closed internet would look like — pay directly for access, no control over the integrity of results, no peer-to-peer. The benched mesh-vs-funnel figure (fig-open-internet-vs-closed-ai) can back this beat if wanted.">
      <SlideStack gap="tight">
        <SlideKicker>The internet</SlideKicker>
        <SlideStatement size="lead">
          No one owns it. Everyone won.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // Why open weights: a section marker, then one benefit per slide, each
  // paired with its felt example from Ben's material. All await his pass.
  "why-open-weights": (
    <PresentationSlide note="TODO: wording draft, Ben to pass. Example/drill slides to follow this one; the per-benefit ammunition lives in the benched benefit-* slides' notes.">
      <SlideStack align="start">
        <h2>Why open weight models?</h2>
        <ul>
          <li>You can freely access information</li>
          <li>
            Tech companies can&rsquo;t sell your chats (or your health and
            bank data)
          </li>
          <li>If tech companies 10x the price, you have another option</li>
          <li>No one can take your model away</li>
          <li>Community improvements come straight to you</li>
          <li>Fully customizable</li>
          <li>
            Runs on hardware you already own (making what you paid for worth
            more)
          </li>
          <li>You can reduce cost for your existing AI usage</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-refuse": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — overt: the Fable classifier scandal; covert: risk aversion optimizing the model down, admitted in the system card; closed optimized down to dodge lawsuits vs open optimized up for you; spares: the meme, classifier-tripping malware, soft refusals hurting research. Scandal + system card still need sources Ben has read.">
      <SlideStack>
        <SlideStatement size="lead">It won&rsquo;t refuse you</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-privacy": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — your 2am conversation is not training data; no account, no ID, no identity tied to your questions.">
      <SlideStack>
        <SlideStatement size="lead">It won&rsquo;t sell your chats</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-price": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — no you-hit-your-limit upsell; dependence plus no substitutes equals their price.">
      <SlideStack>
        <SlideStatement size="lead">It won&rsquo;t price gouge you</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-forever": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — when 4o died thousands grieved, nobody with the file lost a thing; answers to no one: not a balance sheet, the culture war, or the sitting administration.">
      <SlideStack>
        <SlideStatement size="lead">It can&rsquo;t be taken from you</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-community": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — the DeepSeek-Flash effect; llama.cpp makes the same file faster every month and you pay no one.">
      <SlideStack>
        <SlideStatement size="lead">Community improvements come straight to you</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-custom": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — tuned to your domain and values, not the average user's; Lea's brainstorm model that elicits creativity instead of doing the work; any model from any lab, swapped freely.">
      <SlideStack>
        <SlideStatement size="lead">It can be exactly yours</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "benefit-on-device": (
    <PresentationSlide layout="center" note="TODO: spoken bullets — your MacBook, your iPhone, today; hardware you already own, not an offline gimmick.">
      <SlideStack>
        <SlideStatement size="lead">
          It runs on hardware you already own
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
  // The three emotional-invoke slides after the why bullets. Title-only
  // until research 03 delivers verified quotes and Ben reads them.
  "invoke-regulated-info": (
    <PresentationSlide note="TODO: Ben to pass. Line 1 is the user-facing banner verbatim from Claude Code issue #66657 (ref 8, reproduced from a bare hello). Lines 2-3 verbatim from the Fable/Mythos system card (ref 9, p13 and pp250-251; PDF also in Ben's Downloads). Ben to read both before presenting.">
      <SlideStack align="start" gap="tight">
        <h2>Big tech chooses what you can know</h2>
        <SlideStatement>
          &ldquo;Fable 5&rsquo;s safety measures flagged this message for
          cybersecurity or biology topics. They may flag safe, normal content
          as well.&rdquo;
          <SlideRef n={8} />
        </SlideStatement>
        <SlideStatement>
          And the ones you can&rsquo;t see, in their own system card:
          &ldquo;these safeguards will not be visible to the user&rdquo;
          &mdash; via &ldquo;prompt modification, steering vectors, or
          parameter-efficient fine-tuning (PEFT).&rdquo;
          <SlideRef n={9} />
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The hermeneutic, taught early: companies say whatever they want, and
  // one incentive rules them. Hand the room the decoder ring at slide 3 and
  // every corporate quote for the rest of the talk translates itself.
  "companies-dont-say-what-they-mean": (
    <PresentationSlide note="TODO: wording is Ben's dictation — Ben to pass. Spare sourced pairs if wanted: the avoid-doomerism essay line (darioamodei.com/essay/the-adolescence-of-technology) and the people-call-me-a-doomer line (Big Technology transcript, singjupost.com).">
      <SlideStack align="start">
        <h2>Companies don&rsquo;t say what they mean</h2>
        <ul>
          <li>They say whatever THEY want (ex. Trump)</li>
          <li>
            Companies like Anthropic care about one thing above everything
            else: the IPO
          </li>
        </ul>
        <SlideStatement size="lead">
          How can we use this to translate what they say &mdash; and find
          out what they really mean?
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  // The translator: their words on the left, verbatim; what the words mean
  // on the right. The worked example, diving under the setup.




  "translator-chips": (
    <PresentationSlide note="TODO: Ben's translation. Quote verbatim, Bloomberg Davos interview (ref 12).">
      <SlideStack align="start" gap="tight">
        <SlideKicker>Anthropic Translator</SlideKicker>
        <SlideStatement size="lead">
          &ldquo;It would be a big mistake to ship these chips. I think this is
          crazy. It&rsquo;s a bit like selling nuclear weapons to North
          Korea.&rdquo;
          <SlideRef n={12} />
        </SlideStatement>
        <SlideKicker tone="accent">Translation</SlideKicker>
        <SlideStatement>
          We don&rsquo;t want China to build competing companies that hurt our
          valuation.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "translator-surveillance": (
    <PresentationSlide note="TODO: Ben's translation. Quote verbatim from Anthropic's Department of War statement (ref 13); context: they support defense work and are open to autonomous-weapons research once systems are reliable enough.">
      <SlideStack align="start" gap="tight">
        <SlideKicker>Anthropic Translator</SlideKicker>
        <SlideStatement size="lead">
          &ldquo;Mass domestic surveillance &hellip; is incompatible with
          democratic values. &hellip; frontier AI systems are simply not
          reliable enough to power fully autonomous weapons.&rdquo;
          <SlideRef n={13} />
        </SlideStatement>
        <SlideKicker tone="accent">Translation</SlideKicker>
        <SlideStatement>
          Let&rsquo;s get America on our good side and be social responsible
          since it&rsquo;s convenient for us right now. That will increase
          our IPO price.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "translator-regulation": (
    <PresentationSlide note="TODO: Ben's translation. Quote verbatim, ABC News interview (ref 14).">
      <SlideStack align="start" gap="tight">
        <SlideKicker>Anthropic Translator</SlideKicker>
        <SlideStatement size="lead">
          &ldquo;We&rsquo;re proposing stronger regulation of the technology,
          proposing giving the government the ability to, again, in a narrow
          way, block deployment of unsafe technology.&rdquo;
          <SlideRef n={14} />
        </SlideStatement>
        <SlideKicker tone="accent">Translation</SlideKicker>
        <SlideStatement>
          Peter Thiel is so smart, we do need to become a monopoly. Let&rsquo;s
          use the guise of AI safety to become the government&rsquo;s pet,
          so that we can help them regulate our competitors out of
          business!
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "translator-nuclear": (
    <PresentationSlide note="TODO: Ben's translation. Quote verbatim from Dario's Policy on the AI Exponential (ref 15).">
      <SlideStack align="start" gap="tight">
        <SlideKicker>Anthropic Translator</SlideKicker>
        <SlideStatement size="lead">
          &ldquo;There may come a time &hellip; when the most powerful AI
          systems look less like airplanes or automobiles and more like
          weaponizable nuclear materials.&rdquo;
          <SlideRef n={15} />
        </SlideStatement>
        <SlideKicker tone="accent">Translation</SlideKicker>
        <SlideStatement>
          We are definitely the only ones that should control access to AI, so
          we can fearmonger to convince the public we&rsquo;re protecting
          them! Then they&rsquo;ll have no other option but to pay 10x of
          what they do now when we IPO and jack up our prices!
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "translator-ban": (
    <PresentationSlide note="TODO: Ben's translation. Quote verbatim from Anthropic's open-weights position post (ref 16), responding to accusations they want open models banned.">
      <SlideStack align="start" gap="tight">
        <SlideKicker>Anthropic Translator</SlideKicker>
        <SlideStatement size="lead">
          &ldquo;Anthropic has never advocated for a ban on open-weights
          models. Open-weights models that don&rsquo;t have dangerous
          capabilities are a public good.&rdquo;
          <SlideRef n={16} />
        </SlideStatement>
        <SlideKicker tone="accent">Translation</SlideKicker>
        <SlideStatement>
          Fucking hell dude Moonshot is going to kill our IPO what do we do???
          We can&rsquo;t let the public find out that they have a better
          claude cowork replacement for cheaper than us!
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "translator-fine-print": (
    <PresentationSlide note="TODO: fine-print translations draft, Ben to pass. Left column verbatim from the system card (ref 9) and launch announcement.">
      <SlideStack align="start">
        <h2>Anthropic Translator, the fine print</h2>
        <SlideColumns>
          <SlideColumn label="They say">
            <ul>
              <li>
                &ldquo;Competitive use safeguards&rdquo;
                <SlideRef n={9} />
              </li>
              <li>
                &ldquo;These safeguards will not be visible to the
                user&rdquo;
                <SlideRef n={9} />
              </li>
              <li>
                &ldquo;The same underlying model as Fable 5, but with the
                safeguards lifted in some areas&rdquo;
              </li>
            </ul>
          </SlideColumn>
          <SlideColumn label="Translation" tone="accent">
            <ul>
              <li>We degrade the model if your work competes with ours</li>
              <li>And we won&rsquo;t tell you when we&rsquo;re doing it</li>
              <li>The good one is for approved customers</li>
            </ul>
          </SlideColumn>
        </SlideColumns>
      </SlideStack>
    </PresentationSlide>
  ),

  "invoke-data-privacy": (
    <PresentationSlide note="TODO: Ben to pass. The order quote is verbatim from ECF 551 p3 (ref 10). CORRECTION lives in the spoken track: the broad obligation ended September 26, 2025 (OpenAI's Oct 2025 update) — say a court DID order it, not that it stands today. ID-verification receipts (government ID plus selfie, both labs) in research 03 for the spoken track.">
      <SlideStack align="start" gap="tight">
        <h2>It can be used against you</h2>
        <SlideStatement>
          A federal court ordered OpenAI to &ldquo;preserve and segregate all
          output log data that would otherwise be deleted on a going forward
          basis until further order of the Court&rdquo; &mdash; expressly
          including chats users deleted.
          <SlideRef n={10} />
        </SlideStatement>
        <SlideStatement>
          Your deleted conversations, held for a lawsuit you were never part
          of.
        </SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "invoke-perf-cost": (
    <PresentationSlide note="TODO: research 03 DELIVERED — Ben to read, then the table goes on. Headlines: Fable 5 output is ~57x DeepSeek V4 Pro list price, ~3.3x Kimi K3; ChatGPT tiers now $20/$100/$200; the DeepSeek release erased $593B of Nvidia in a day (record one-day loss). CAVEATS: list prices are not quality-normalized; do not call Qwen3.8 open-weight (no verifiable checkpoint); recheck prices right before the talk.">
      <SlideStack align="start">
        <h2>The direct comparison</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-do-you-start": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass.">
      <SlideStack>
        <h2>How do you start?</h2>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-hosted": (
    <PresentationSlide note="TODO: wording draft, Ben to pass — his exact provider/model pairing.">
      <SlideStack align="start">
        <SlideKicker>Step 1 &middot; someone else hosts it</SlideKicker>
        <h2>Use open models that someone else hosts</h2>
        <ul>
          <li>OpenRouter puts every open model behind one key</li>
          <li>Point Claude Code, Codex, or pi at it</li>
          <li>Same workflow &mdash; fraction of the cost</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-own-hardware": (
    <PresentationSlide note="TODO: wording draft, Ben to pass.">
      <SlideStack align="start">
        <SlideKicker>Step 2 &middot; hardware you already own</SlideKicker>
        <h2>Run models on your own machine</h2>
        <ul>
          <li>Install Ollama</li>
          <li>Pull a small model</li>
          <li>Talk to it</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-find-models": (
    <PresentationSlide note="TODO: wording draft, Ben to pass — his actual picks and how he'd tell someone to choose.">
      <SlideStack align="start">
        <SlideKicker>Step 3 &middot; pick your model</SlideKicker>
        <h2>Find the best model</h2>
        <ul>
          <li>Hugging Face is the library</li>
          <li>Match model size to your machine</li>
          <li>Pick for your use case, not the leaderboard</li>
        </ul>
      </SlideStack>
    </PresentationSlide>
  ),

  "how-cloud": (
    <PresentationSlide note="TODO: wording draft, Ben to pass.">
      <SlideStack align="start">
        <SlideKicker>Step 4 &middot; optional scale</SlideKicker>
        <h2>Rent GPUs</h2>
        <ul>
          <li>Frontier-size open models, by the hour</li>
          <li>Your model and your data, on rented iron</li>
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
    <PresentationSlide layout="center" note="TODO: benched — cut from the setlist.">
      <SlideStack gap="tight">
        <SlideStatement size="lead">Own the weights.</SlideStatement>
        <SlideStatement>AI they can&rsquo;t use against you.</SlideStatement>
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

  // ---- Benched cuts, resurrected from git history per Ben's save-
  // everything call. None are in the setlist.

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

  "thesis": (
    <PresentationSlide layout="center">
      <SlideStack gap="none">
        <SlideStatement>{thesis[0]}</SlideStatement>
        <SlideArrow label="Thus" />
        <SlideStatement>{thesis[1]}</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

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

  "receipt-community-speed": (
    <PresentationSlide layout="center" note="TODO: wording draft, Ben to pass. This is the DeepSeek-Flash effect / llama.cpp beat from the pres note: the same file gets faster because thousands of people optimize it, and you pay no one.">
      <SlideStack gap="none">
        <SlideKicker>Your model file</SlideKicker>
        <SlideStatement>Downloaded once</SlideStatement>
        <SlideArrow label="Then" />
        <SlideStatement size="lead">Faster every month &mdash; you pay no one</SlideStatement>
      </SlideStack>
    </PresentationSlide>
  ),

  "dynamic-dependence-draft": (
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

  "dynamic-no-substitutes-draft": (
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
