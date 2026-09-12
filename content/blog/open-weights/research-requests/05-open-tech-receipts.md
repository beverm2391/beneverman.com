# Research 05, open-tech-goes-right receipts

Feeds the `when-open-tech-goes-right` slide: three themes, each needing the
best 1-2 real examples. The deck's evidence rule applies: recent, emotional,
relatable to a mixed room of technical people and ordinary ChatGPT users.
Do NOT overfit to the canonical well-known examples (Wikipedia, Linux, VLC);
those are the fallback, not the target. Hunt for newer, less ubiquitous,
more visceral receipts that beat them. Ben presents TONIGHT (Aug 12, ~8pm);
findings before ~7pm are usable, later is for the published post.

## Theme 1 — ownership: buy to own AND customize, vs buy to rent and closed

The contrast is not just keep-forever vs revocable. It is: open tech you buy
once, own forever, and can modify; closed tech you "buy" but actually rent,
cannot modify, and can lose. Candidates to verify and beat:

- Amazon removing the Kindle "Download & Transfer via USB" feature (reported
  Feb 2025) — exact scope and date, primary or contemporaneous source.
- Sony deleting purchased Discovery/movie content from PlayStation accounts
  (Dec 2023, partially reversed?) — what actually happened, dated.
- Ubisoft shutting The Crew and revoking licenses (2024) and the Stop
  Killing Games movement it spawned — dates, numbers, the angriest
  defensible quote.
- Anything newer/stronger in this shape: hardware or media people paid for,
  then lost or lost control of, ideally 2024-2026.

## Theme 2 — peer to peer, no central authority: no one can gouge or gate you

Anchor example is already chosen by Ben: anyone can publish to the internet
tonight without asking permission. Find 1-2 more with the same feel:

- Podcasting/RSS staying open despite Spotify's enclosure attempt — is there
  a dated, citable receipt (Spotify exclusives reversal, 2023-2024)?
- BitTorrent's unkillability, or a fresher equivalent.
- Newer examples preferred: open protocols beating platform lock-in,
  2023-2026 (ActivityPub/Fediverse growth after the Twitter turmoil? RCS
  adoption forced onto Apple? Verify what is actually defensible).

## Theme 3 — community beats paid: OSS killing products people paid for

Linux and Wikipedia-killed-Encarta are the fallbacks. Find better: recent,
less-worn examples where a free community project beat a paid closed product
so clearly that the paid product died, pivoted, or went free. Candidates:

- OBS vs paid streaming software (XSplit) — did the paid product measurably
  lose? Dated evidence.
- Blender's industry adoption vs Maya/3ds Max seats — a dated studio or
  market receipt, not vibes.
- 2023-2026 examples strongly preferred: dev tools, creative tools, consumer
  apps where the community version won recently enough to feel current.

## Output

- One block per example: the claim in one sentence, the dated facts with
  links (primary or contemporaneous), why it is emotional/relatable, and
  caveats. Rank within each theme by cringe-per-word / felt impact.
- Recency beats fame. An example the room half-knows but FEELS beats a
  canonical one they have heard a hundred times.
- Append findings to this file; Ben reads before anything is cited.

## Findings, ranked for tonight

If the slide needs only one receipt per theme, use these:

1. **Ownership:** PlayStation will delete hundreds of movies that UK customers previously purchased. Sony's own notice uses the words `previously purchased content`.
2. **No central authority:** Meta's own fediverse explainer says, `Meta doesn’t own the fediverse.`
3. **Community beats paid:** Mega Crit abandoned Unity for the open-source Godot engine, then sold 3 million copies of *Slay the Spire 2* in its first week.

### Theme 1, ownership

#### 1. PlayStation will delete 551 previously purchased movies on September 1, 2026

**Claim:** Sony sold UK customers movies as purchases, but its current legal notice says access will end and the movies will disappear from their libraries.

**Dated facts:** Sony's [current StudioCanal removal notice](https://www.playstation.com/en-gb/legal/psvideocontent/) says: `From September 1, 2026 ... you will no longer be able to access your previously purchased content`. The page lists the affected titles. [Tom's Hardware counted 551](https://www.tomshardware.com/video-games/playstation/playstation-is-removing-over-500-movies-from-uk-customers-accounts-with-no-refunds-iconic-films-like-terminator-2-apocalypse-now-and-mulholland-drive-are-getting-deleted), including *Terminator 2*, *Apocalypse Now*, *Moonlight*, *Paddington*, and *The Wicker Man*. Its June 28 report says customers were not offered refunds.

**Why it lands:** This is current, ordinary, and impossible to abstract away. The company's own sentence contains both `previously purchased` and `removed from your video library`. The audience does not need to understand licensing or DRM.

**Caveats:** This is a UK PlayStation Store action tied to StudioCanal rights, not every PlayStation purchase worldwide. The removal is scheduled for September 1, 2026, so describe it as announced and imminent until that date. Sony reversed a similar Discovery removal in 2023 after new licensing arrangements, so this one could still change.

#### 2. Humane sold a $699 AI computer, then gave customers ten days' notice that its connected functions would stop

**Claim:** Closed AI hardware can become almost useless when the company behind it disappears, even though the customer still possesses the device.

**Dated facts:** Humane announced the shutdown on February 18, 2025. Its [consumer FAQ](https://support.humane.com/hc/en-us/articles/34243204841997-Ai-Pin-Consumers-FAQ) said that at noon Pacific on February 28, Ai Pin would lose server connectivity and connected features. [Axios reported](https://www.axios.com/2025/02/18/humane-ai-pin-shut-down-hp) that calling, messaging, AI queries, and cloud access would end. The Pin launched at [$699 plus a required $24 monthly subscription](https://www.axios.com/2023/11/09/humane-ai-pin-orders-next-week). Humane limited refunds to products shipped on or after November 15, 2024, according to its FAQ. Earlier buyers were outside that refund window.

**Why it lands:** It is an AI-specific receipt. A person bought a physical AI computer, but the useful computer lived on someone else's servers. Ten days after the shutdown announcement, the hardware retained only narrow offline status functions.

**Caveats:** The product was commercially unsuccessful and poorly reviewed, so it does not show that every cloud AI product will fail this way. Some recent buyers received refunds. Do not say the device became a literal brick; basic offline information such as battery level remained.

#### 3. Backup with the cleanest open-versus-closed contrast: Spotify killed Car Thing; the community made DeskThing

**Claim:** Spotify could remotely disable hardware it sold, but community software could repurpose the same physical device after Spotify walked away.

**Dated facts:** Spotify disabled all Car Thing units on December 9, 2024, [confirming to TechCrunch](https://techcrunch.com/2024/12/09/spotify-car-thing-units-are-officially-disabled/) that the devices were no longer operational. The community-built [DeskThing project](https://deskthing.app/about) describes itself as `100% Open Source`, `100% Expandable`, and `100% Capable`. It provides a replacement platform for custom apps on Car Thing and continues shipping releases for Windows, macOS, and Linux.

**Why it lands:** One physical object contains both halves of the argument. The vendor made it e-waste; people with code access gave it a second life and new functions.

**Caveats:** Car Thing was not sold as open hardware, and DeskThing is a reverse-engineered rescue rather than continuity guaranteed by the original product. Installation remains much harder than using the stock device. Spotify eventually offered refunds to eligible owners, so the clean claim is remote disablement and community reuse, not that every owner lost the purchase price.

#### Kindle is real but weaker

Amazon removed `Download & Transfer via USB` on February 26, 2025. [Ars Technica's contemporaneous report](https://arstechnica.com/gadgets/2025/02/psa-amazon-kills-download-transfer-via-usb-option-for-kindles-this-week/) correctly narrows the effect: customers lost the website route for downloading purchased Kindle files to a computer, but books already downloaded remained usable and other transfer methods still existed. This is a good control-and-backup receipt, not a deletion receipt. Use it only if the audience cares about offline libraries and DRM.

### Theme 2, peer to peer and no central authority

#### 1. Meta joined a network it explicitly says it does not own

**Claim:** An open protocol can make even Meta participate as one server among many instead of owning the whole social graph.

**Dated facts:** Meta's June 25, 2024 [fediverse explainer](https://about.fb.com/news/2024/06/what-is-the-fediverse/) says: `Meta doesn’t own the fediverse. Threads is just one of many servers that has joined it.` It also says people on other compatible servers can follow and interact with Threads users without a Threads account. By June 2025, Meta said [Threads had interacted with more than 75% of fediverse servers](https://about.fb.com/news/2025/06/its-now-easier-see-more-fediverse-content-threads/) and could search for users and display posts originating on Mastodon, WordPress, Flipboard, and other services.

**Why it lands:** The receipt comes from Meta, not an open-web advocate. The company that built Facebook's walled garden had to describe itself as one participant in a network it cannot own.

**Caveats:** Threads federation is opt-in and incomplete. Meta still controls Threads, its ranking, and its moderation. This proves protocol-level interoperability, not that Threads itself is decentralized or benign.

#### 2. Spotify paid to make the world's biggest podcast exclusive, then put it back on competing platforms

**Claim:** Podcasting's open distribution model survived Spotify's enclosure push; the biggest exclusive returned to Apple Podcasts, YouTube, and other platforms.

**Dated facts:** Spotify made *The Joe Rogan Experience* exclusive in 2020. In its [February 2, 2024 renewal announcement](https://newsroom.spotify.com/2024-02-02/the-art-of-podcasting-with-joe-rogan-and-his-new-multiyear-spotify-partnership/), Spotify said the show would soon be available on additional platforms. [Associated Press reported](https://apnews.com/article/76fa0e2c9d4b137f510428528ea6226b) that the new deal put it on competitors including YouTube and Apple Podcasts.

**Why it lands:** Spotify spent years trying to make `podcast` mean `show inside Spotify`, then its crown-jewel show went back to being available wherever listeners already were.

**Caveats:** This does not prove RSS or decentralization forced Spotify's decision. Spotify retained the commercial relationship and ad sales. The defensible claim is that exclusivity reversed while the wider podcast ecosystem remained available, not that the protocol defeated Spotify in a measured causal contest.

### Theme 3, community beats paid

#### 1. *Slay the Spire 2* left Unity for Godot, then sold 3 million copies in one week

**Claim:** A studio abandoned a proprietary engine after a trust-breaking fee announcement, shipped its sequel on the community-built Godot engine, and produced one of 2026's biggest PC launches.

**Dated facts:** After Unity announced its Runtime Fee in September 2023, Mega Crit said it had already spent more than two years building its next game in Unity but would migrate unless the changes were fully reversed with terms-of-service protections. The statement ended: `We have never made a public statement before. That is how badly you fucked up.` In September 2024, Mega Crit's [own development update](https://www.megacrit.com/news/2024-09-09-neowsletter-issue-2/) said the game had been ported to Godot and stabilized. Unity [canceled the Runtime Fee](https://unity.com/blog/unity-is-canceling-the-runtime-fee) on September 12, 2024. On March 13, 2026, Mega Crit reported that [*Slay the Spire 2* sold 3 million units and logged more than 25 million runs in its first week](https://www.megacrit.com/news/2026-3-13-neowsletter-issue-20/).

**Why it lands:** The paid vendor tried to change the deal after developers had invested years. A small studio paid the switching cost, used an MIT-licensed community engine, and delivered a massive hit. The audience can feel both the captivity and the escape.

**Caveats:** Godot did not kill Unity. Unity remains widely used, and its fee never took effect. The strong claim is narrower: a prominent studio left, Unity reversed the policy, and the open alternative proved it could ship a blockbuster-scale release.

#### 2. Redis closed its license; the community forked it in eight days; Redis reopened a year later

**Claim:** When Redis Inc. tried to turn a community-built database into source-available company property, contributors and major users forked it, and Redis later restored an OSI-approved open-source option.

**Dated facts:** Redis announced its move from BSD to RSALv2/SSPLv1 on March 20, 2024 in its [license-change post](https://redis.io/blog/redis-adopts-dual-source-available-licensing/). On March 28, the [Linux Foundation launched Valkey](https://www.prnewswire.com/news-releases/linux-foundation-launches-open-source-valkey-community-302102803.html) from Redis 7.2.4 under BSD, backed by contributors and companies including AWS, Google Cloud, Oracle, Ericsson, and Snap. On May 1, 2025, Redis announced an [AGPLv3 option for Redis 8](https://redis.io/blog/agplv3/) and directly admitted that the 2024 change `hurt our relationship with the Redis community`.

**Why it lands:** The eight-day response is the point. The company controlled the trademark and new releases, but it could not revoke the community's right to continue the last open code. The fork made the threat real enough that Redis returned to an approved open-source license.

**Caveats:** Redis says the licensing change also achieved its goal of making AWS and Google maintain a fork, and the company reports strong growth. Valkey did not make Redis die. This is a clean receipt for the power to fork and force a pivot, not a clean paid-product death.

### Leads rejected or downgraded

- **Sony and Discovery, 2023:** Sony announced that purchased Discovery content would be removed, then reversed the decision after updated licensing arrangements. It is a warning, not a completed deletion. The 2026 StudioCanal notice is fresher and stronger.
- **Ubisoft and *The Crew*:** The game was sold until December 2023 and became unplayable after its servers closed in April 2024. It helped trigger Stop Killing Games. This is strong, but PlayStation's current `previously purchased content` wording and Humane's AI-specific shutdown are shorter, newer receipts. Keep *The Crew* as a gaming backup.
- **OBS versus XSplit and Blender versus Maya:** No recent, clean evidence found that the open project directly killed the named paid product. Their adoption is real, but the requested `paid product died, pivoted, or went free` causal shape would be overclaimed.
- **RCS on iPhone:** Apple's adoption followed regulatory and competitive pressure, but RCS remains carrier-mediated rather than peer to peer. It is a weak fit for the slide's no-central-authority claim.
