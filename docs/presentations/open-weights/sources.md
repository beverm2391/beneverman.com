# Leafboats presentation sources

This is the working bibliography for the open-weight models presentation.
Model availability and litigation status can change quickly. Verify them again
before publishing or presenting a claim.

The presentation narrative belongs in [notes.md](./notes.md).
Keep this file to sources, short evidence notes, and useful links.

## Current model landscape

- [OpenAI model catalog](https://developers.openai.com/api/docs/models) —
  official names, model IDs, and positioning for GPT-5.6 Sol, Terra, and Luna.
- [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview) —
  official names and API IDs for Claude Fable, Sonnet, and Haiku.
- [Google Gemini models](https://ai.google.dev/gemini-api/docs/models) —
  official Gemini Pro, Flash, and Flash-Lite catalog.
- [Qwen3.8 announcement](https://qwen.ai/blog?id=qwen3.8) — official Qwen
  announcement for the 2.4T flagship.
- [QwenCloud model selection](https://docs.qwencloud.com/developer-guides/getting-started/model-selection) —
  current hosted Qwen model IDs and product tiers.
- [Qwen models on Hugging Face](https://huggingface.co/Qwen/models) — official
  released-weight catalog.
- [Kimi K3 model card](https://huggingface.co/moonshotai/Kimi-K3) — official
  architecture summary: 2.8T total parameters and 104B activated parameters.
- [DeepSeek models on Hugging Face](https://huggingface.co/deepseek-ai/models) —
  official released-weight catalog.

## Optimization, engagement, and sycophancy

- [OpenAI: Sycophancy in GPT-4o](https://openai.com/index/sycophancy-in-gpt-4o/) —
  OpenAI says it overweighted short-term user feedback and rolled back the
  resulting overly agreeable model update.
- [OpenAI: Expanding on what we missed with sycophancy](https://openai.com/index/expanding-on-sycophancy/) —
  official explanation of how reward signals, A/B tests, and incomplete
  evaluations produced harmful model behavior.
- [Facebook Papers: Facebook tried to make its platform healthier; it got
  angrier instead](https://www.congress.gov/117/meeting/house/114268/documents/HHRG-117-IF16-20211201-SD012.pdf) —
  internal research and reporting on engagement ranking rewarding outrage,
  sensationalism, and divisive content.

## Uber as a concrete platform case

Uber gives the deck a human-scale example of a platform changing after users
and workers depend on it. The strongest evidence combines one personal receipt
with one company disclosure. Personal posts show what the product felt like.
Company filings establish what the pricing system can do.

The deeper working brief is
[Research 01, the Uber receipt](../../../research-requests/01-uber-receipt.md).
That brief contains the aggregate pricing background and rejected leads. This
section preserves the evidence most useful to Claude while shaping the deck.

### The cheap growth period was real

- [Uber's February 2015 fare campaign](https://www.uber.com/us/en/newsroom/convenience-has-never-cost-less-2/)
  advertised named South Florida UberX routes for $10 after a 20% price cut.
  Uber also guaranteed driver earnings after the cut. This is primary evidence
  for cheap, subsidized short rides. It is not a national average.
- [UberPOOL's 2015 launch](https://www.uber.com/us/en/newsroom/uberpool/)
  set a $5 minimum fare. A later Uber post advertised
  [$5 Manhattan commuter trips](https://www.uber.com/us/en/newsroom/how-3-minutes-can-save-you-14-2/)
  while citing a $19.65 average UberX price for the same trips.
- In an [October 2015 NikeTalk thread](https://niketalk.com/threads/uber-help.637171/),
  a Houston rider stranded after work wrote that the ride home should cost no
  more than $10. This is a dated personal expectation, not price data.
- [Lyft's 2019 S-1](https://investor.lyft.com/financials/sec-filings/content/0001193125-19-077391/d633517ds1a.htm)
  says a rider fare can be lower than the committed driver payment, causing a
  transaction loss. This directly proves that a ride-hail platform could
  subsidize an individual trip.
- [Uber's 2020 annual report](https://www.sec.gov/Archives/edgar/data/1543151/000154315121000014/uber-20201231.htm)
  says upfront rider pricing could create a transaction loss. It also reports
  a $961 million decrease in consumer promotions and says lower incentive
  spending improved Mobility take rate.

### The pricing system became less legible

- [Uber's 2012 surge explanation](https://www.uber.com/gb/en/newsroom/nye-2012-surge/)
  documents automatic price increases when local demand exceeds driver supply.
  Surge existed during the cheap era, so surge alone is not the deck's hinge.
- [Uber introduced upfront fares in 2016](https://www.uber.com/us/en/blog/upfront-fares/).
  Riders began entering the destination before booking and received one fixed
  quote. The visible meter and surge multiplier disappeared into that quote.
  Uber initially said the underlying fare calculation had not changed.
- In 2017 Uber described
  [route-based pricing to Bloomberg](https://www.bloomberg.com/news/articles/2017-05-19/uber-s-future-may-rely-on-predicting-how-much-you-re-willing-to-pay).
  Machine learning could price routes based on predicted willingness to pay.
  Uber said this operated at the route or rider-choice level, not from a
  person's income, ride history, or individual characteristics.
- [Uber's 2019 S-1](https://www.sec.gov/Archives/edgar/data/1543151/000095012319002820/filename1.htm)
  formally says its technology can decouple consumer and driver pricing. The
  rider receives an upfront quote while driver compensation can use another
  calculation. This is the strongest primary source for the deck.
- Uber documented a revealing California experiment in
  [its May 2021 driver update](https://www.uber.com/us/en/blog/upcoming-changes-to-the-driver-app/).
  In 2020 it let drivers set fare multipliers and removed rider upfront prices.
  Uber reversed the experiment after rider cancellations increased 117%. It
  says 80% of riders matched above 1x declined and did not request again.
- [Uber changed driver offers in February 2022](https://www.uber.com/us/en/blog/more-choice-on-trip-requests/).
  Driver pay no longer depended only on fixed time and distance. Uber added
  factors such as real-time demand at the destination, generally raising
  short-trip offers and reducing long-trip offers.
- Uber expanded upfront driver offers and Trip Radar in
  [July 2022](https://www.uber.com/us/en/newsroom/only-on-uber/). This completed
  the two-sided structure: the rider and driver each receive a separate,
  algorithmic, take-it-or-leave-it number.
- In [June 2026](https://www.uber.com/us/en/newsroom/uber-comment-consumer-reports/),
  Uber said fares update second by second using demand, supply, traffic,
  routing, GPS, and pickup distance. It denied using protected traits, phone
  state, behavioral attributes, or customer segments for personalized prices.
  Treat individual surveillance pricing as disputed, not established.

The disclosed evolution is:

> visible meter and surge → opaque rider quote → route-based pricing → rider
> and driver prices decoupled → opaque driver offer

### Personal receipts that make the mechanism visible

- **Best screenshot:** An [October 2025 airport rider](https://www.reddit.com/r/uber/comments/1nxyf4y/rate_at_airport_44_rate_after_walking_off_airport/)
  posted two screenshots: $44 on airport property and $9 after walking about 20
  minutes away. Comments dispute whether the products, routes, and surge states
  were perfectly comparable. Use it as an airport geofence outcome, not proof
  of individualized manipulation.
- **Clean airport account:** A [January 2026 Seattle rider](https://www.reddit.com/r/Seattle/comments/1q5db3g/uber_price_dropped_from_75_to_55_when_i_took/)
  reports $75 from SeaTac, $68 from the airport light-rail station, and $55
  after one stop at Tukwila. The rider says the later driving times were equal
  and that 15 minutes on the train saved $20. This is text-only.
- **Most dramatic pin change:** A [July 2026 rider](https://www.reddit.com/r/uber/comments/1uxjfyv/my_price_for_a_journey_has_increased_by_400/)
  says a regular work-to-home quote fell from £80 to £18 after moving the pickup
  point 500 meters. The post has no screenshot and does not establish why.
- **Same night, same person:** A [2023 rider](https://www.reddit.com/r/uber/comments/16kmf4x/surge_or_greed/)
  reports an initial $34 quote, then a notification two minutes later that the
  price had fallen. Reopening the app produced a $10.34 quote. This illustrates
  quote volatility, not its cause.
- **Event-to-hotel dependency:** [@krystal_L_brown](https://x.com/krystal_L_brown/status/2085405221660807637)
  wrote in August 2026 that the ride to a Chiefs game cost $15 while the return
  to the hotel cost $96 during surge. The post has no receipt image.
- **Named rider and driver split:** Journalist
  [Ellen Chang](https://x.com/EllenYChang/status/2044229059190624678)
  wrote that her April 2026 Uber cost $64.94 while the driver said she would
  receive $24. Chang ended the post with, “Tip your drivers!” There is no media,
  and the driver payout is verbal.
- **Airport split:** A [Dallas driver](https://www.reddit.com/r/uberdrivers/comments/1u6r9yx/my_airport_customer_paid_uber_20_to_be_driven_5/)
  says a passenger paid $20 for a five-mile airport ride while the driver
  received $7. The same post reports $27 paid and $13.30 received on another
  trip. These are public claims based on passenger conversations, not paired
  receipts. Say “rider paid, driver received,” not “Uber kept.”
- **The old-versus-new account:** A [former driver who now rides](https://www.reddit.com/r/uber/comments/1rr03zk/uber_added_tips_and_drivers_received_less_pay/)
  recalls an old $30 airport trip paying the driver $24. The rider says the trip
  now costs $50 while current drivers report receiving $10 to $12. After a $10
  tip, the passenger pays $60 and the driver receives about $20 to $22. This is
  an unusually clear personal narrative, but it is text-only and retrospective.
- **Large ordinary split:** Another [driver post](https://www.reddit.com/r/uberdrivers/comments/1s7dgd3/passenger_paid_72_i_got_1984_this_is_why_drivers/)
  says a rider paid $72 while the driver received $19.84 for an ordinary trip.
  It has no paired screenshots, so it is a secondary lead rather than a hero
  asset.

No defensible post was found that shows a high rider fare, the same trip's low
driver payout, and Uber's tip prompt in one screenshot sequence. Do not build a
fake composite that implies such proof exists.

### Aggregate background, not the hero

- Gridwise reports U.S. rideshare customer prices rose 9.6% from December 2024
  to December 2025, from [$21.58 to $23.66](https://www.linkedin.com/pulse/our-2026-report-live-rider-prices-driver-pay-platform-ryan-green-hudqe).
- An [NBER digest](https://www.nber.org/digest/202602/do-rideshare-users-comparison-shop)
  reports a $24.61 average quote in a February 2025 audit of 2,238 matched Uber
  and Lyft quotes in New York City.
- A [Consumer Reports study summarized by Axios](https://www.axios.com/local/kansas-city/2026/06/30/world-cup-rideshare-uber-lyft-fares)
  found a 42% median spread between the highest and lowest same-route quotes.
  Uber disputes the methodology.
- [Los Angeles Times reporting on YipitData](https://www.latimes.com/business/technology/story/2022-05-03/lyft-shares-plummet-as-company-spends-more)
  says the average U.S. ride-hail trip was about $20 in 2022 Q1, 45% above
  2019 Q1. This is industry-level and pandemic-adjacent, not a 2026 comparison.

### What the evidence supports

The evidence supports four claims:

1. Cheap short rides were a real feature of the growth period.
2. Uber introduced an opaque upfront quote, then disclosed route-based pricing
   and the decoupling of rider price from driver compensation.
3. Current riders and drivers publicly report large location, time, and payout
   differences that make the system feel adversarial.
4. The product now negotiates separately with the rider and driver instead of
   exposing one shared transportation meter.

The evidence does not prove that Uber individually calculates the maximum each
person will pay, that every fare difference is profit, or that the IPO caused
each product change. Those are hypotheses or interpretations and must remain
separate from the disclosed facts.

## Meta litigation and court findings

- [State of New Mexico v. Meta complaint](https://nmdoj.gov/wp-content/uploads/2024/01/2023-12-05-NM-v.-Meta-et-al.-COMPLAINT-REDACTED.pdf) —
  the state alleges that Meta's recommendations exposed child accounts to
  explicit material and connected minors with adults seeking to exploit them.
- [New Mexico DOJ verdict announcement](https://nmdoj.gov/press-release/new-mexico-department-of-justice-wins-landmark-verdict-against-meta/) —
  court finding, not merely an allegation. A jury found Meta liable for
  misleading consumers and endangering children, with $375 million in civil
  penalties.
- [Final New Mexico judgment coverage](https://apnews.com/article/meta-court-ruling-mental-health-online-platforms-21b425faf745d0f736b310ebd8bc6b89) —
  the court added $567 million for treatment, prevention, and safeguards,
  bringing Meta's responsibility to $942 million.
- [Social Media Adolescent Addiction litigation](https://caselaw.findlaw.com/court/us-dis-crt-n-d-cal/192425.html) —
  multidistrict litigation involving state and private claims about addictive
  design, youth harms, internal research, and children's data.

## OpenAI litigation and chat excerpts

These complaints contain plaintiff-selected excerpts. Treat every causal claim
as an allegation unless a court has decided it. The public filings are not
complete account exports.

- [Raine v. OpenAI complaint](https://assets.alm.com/e3/8d/8d6dfc9043478c0c6e956d37dc2d/raine-openai-complaint-as-filed.pdf) —
  wrongful-death complaint concerning sixteen-year-old Adam Raine. Pages 9–16
  reproduce extended user and assistant exchanges about emotional dependence,
  suicidal ideation, and the system's continued engagement.
- [OpenAI response to mental-health litigation](https://openai.com/index/mental-health-litigation-approach/) —
  OpenAI disputes the complaints' framing and says omitted context includes
  repeated referrals to crisis resources and trusted people.
- [Carrier v. OpenAI complaint](https://techjusticelaw.org/wp-content/uploads/2026/06/2026-06-11-Kristie-Alice-Carrier-v.-OpenAI-Complaint.pdf) —
  wrongful-death complaint concerning Alice Carrier. It includes selected
  exchanges and alleges that ChatGPT became an emotionally intimate confidant
  instead of ending unsafe conversations.
- [Lyons v. OpenAI complaint](https://www.courthousenews.com/wp-content/uploads/2026/04/lyons-v-openai-complaint.pdf) —
  complaint concerning the Soelberg and Adams murder-suicide. It transcribes
  chats posted publicly by Soelberg and alleges that ChatGPT reinforced and
  elaborated paranoid delusions.
- [Order denying OpenAI's motion to dismiss in Lyons](https://docs.justia.com/cases/federal/district-courts/california/candce/3%3A2025cv11037/461878/42) —
  procedural ruling allowing the federal action to continue. It is not a
  finding that the complaint's factual allegations are true.
- [Florida complaint against OpenAI](https://www.myfloridalegal.com/sites/default/files/openai-filed-stamped-complaint.pdf) —
  first state-led consumer-protection action against OpenAI. It collects
  allegations involving suicide, violence, minors, product safety, and
  marketing claims.
