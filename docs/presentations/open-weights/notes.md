# Open Weights AI Models

## How to approach this pres
- Cover a lot of breadth without getting trapped going deep on one thing.
- Serve a mixed audience of highly technical people and curious, nontechnical regular AI users.
- Fit presentation plus discussion/questions into 30 minutes.
- Use lots of analogies and examples.
- Prefer real-world, actionable material; tie concepts directly to implications.
- Make big, aggressive claims and substantiate them afterward.
- Be honest and forceful without fearmongering or rage bait.
- agressively interweave between concept/implication/technical breakdown back and forth

Impliations of open weight models for individuals -> how to use them. Include aggregate when they practically affect the individual


## Intro
Why open weight llms are the most important innovation since X (or some emotional headline)


Open internet vs closed AI

The Aggregate vs the individual
- economics aggregate, then failure of
- real individual

- freedom (individual)
  - access to free info
  - decoupled from big labs + government (id requirments)
    - (technologial determinism)
  - give exmaple of middle school girl who's bully made deepfakes -> created legilation, contrrast with innovations in cancer discovery/imaging
- power (aggregate)
  - knowledge and skills -> agency and grit
- equity (aggregate)
  - education/privledge/access to AI across socioeconomic classes
  - mostly ungoverned (cant predjudice/discriminate)
  - compare open weight models to open internet, describe closed weight vs what closed internet would look like
    - must directly pay for access
    - no control of integrity of results
    - no peer to peer

AI dependency
- think about if you could not use AI at ALL. have you overleveraged (students, SWEs, biz owners, etc.). can think same about internet BUT internet is differnt
- what if OAI/Athropic went down globally
  - financial collapse
  - over regulation
- what if they banned just you personaly

What is open weight AI model? (vs closed weight)
- model where you have weight access (as opposed to closed weight, give examples)
- some people say "local model" - why this is an imprecise term
- classifiers/refusals (covert and overt), ToS violation, logs
- contrast Anthropic marketing vs Qwen marketing (pull media/tweets)

Data privacy debunked (HIPPA, SOC-II, contracts/policy, illegal/full privacy)
- OAI logs vs outlook. training opt out
- bedrook
- fireworks/baseten oss providers
- cloud gpus + oss model
- personal hardware + oss model

Doomerism
- who has heard claims like x, y, z
- why peoplel main these claims (incentives)
  - big labs
  - researchers
  - CEOs
  - individuals
  - journalists

Why does this matter?
- fronteir agents are retarded
- finetune/rl/SAE/run on own hardware/abliterate/etc. (constrast with closed weights)
- include REAL compelling examples
  - aka lea wants to brainstorm ideas, needs a model optimized to talk to and elicit her creativity NOT do any work for her
  - i want to abliterate
    - get infected with malware, they put things in there to intenitonally trip fronteir classifiers, cant help remove malware
    - get information
    - avoid soft refusals that hurt scientific research
    - do something in a grey area that is fine for you but not fine for OAI/Anthropic. I.e. make a meme with the likeness of your friend
  - community optimization benefits everyone, instead of just increasing margin
    - ex. when ds flash came out X -> now
  - no potential ID verification (tied to identity)
  - I want custom finetune/RL on my domain (ex task specific, domain specific)
  - On device
  - distrupted training/inference
- refusals
  - overty aka classifier
  - covert aka fable nerfing pretraining against foreign labs (system card)



What is a weight?
- affine function (y=mx+b)
- basic diagram of input text -> tokenizer -> input -> residual stream -> output
- prefill vs decode

Where can you get weights?
- huggingface

How do you use weights?
- conceptual diagram
- hf -> gpu -> engine (llama ccp/vllm, why engine matters) -> server (local or cloud)
  - prefil vs deode
  - consumer vs commercial gpus
  - NVIDIA vs AMD vs Intel, etc..
  - actual providers to use/prices
- what can you hit the server with?
- cloud gpus/models compared to consumer hardware posibilities
  - fronteir as of today

Why does this matter?
- to governments
- to domestic labs
  - anthropic regulatory capture strategy/hypocracy
  - OAI debt straetgy
  - XAI compute conundrum
  - Google exodus
  - Meta implosion
- to shareholders of domestic labs
- to foreign labs
- to startups
- to me (ben)
- to individuals (you)


Non LLMs
- image models
- video models
- PII detection models
- classifiers


## HEIRARCHY

Open Weight Models

- this pres will focus on the individual implcations such as:
  - personal dependence
  - personal freedom (data privacy, control/configurability, information access)
  - maximum value to you (not big tech companies)
- not the aggregate societal implications like
  - societal liberties
  - large scale harm (cybersec, bioweapons, black swan)
  - institutional power
  - equity

"You are becoming dependent on intelligence you neither own nor control. That dependence is the business model."
because:
"Fronteir labs optimize for profit (among other things), not for your value/privacy/sercitury"
thus:
"Open Weight Models are better overall, since it’s easier to run when someone else hasn’t chained your ankles together."

Dependence is not inherently bad
- I depend on my phone to live
- I depened on the internet to live

Dependence, Money, and Loss
- PE is how sensitive you are to price changes. I.e if a starbucks latte was 2xd, would I still buy it? (elastic)
- If the price of my heart medication is 2xd, would I still buy it? (inelastic)
- The more dependent you are, the less sensitive you are to price changes (or loss of access) (diagram) AND the more consequnce of loss of access

So, for those of us like myself who depend on AI to:
- do our work
- run our business
- help manage our health or finances
- answer complex questions
we are generally less senstive to price changes AND more vulnerable if we lose access (diagram)


"Overreliance"
Examples:
an artist starts AI generating theirdigital art and gradually loses their ability to make it
a person consumes more and more short form dopamine spiking content and their brain loses tolerance for long form reading/sustained cognitive effors
a person becomes dependent on a substance which has adverse effects and increasing need for that substnace

For AI:
Domain Knowledge x AI multiplier = Performance (diagram)
The more of a task’s reasoning you delegate to AI without preserving a mental model, the less domain knowledge you gain from doing it.
THEREFORE Short term overreliance creates and ever increasing NEED TO rely.

Thus, the problem.

As you use AI to offload cognition, you slow down your rate of learning, which gradually decerases your performance WITH AI (per model), requiring ever increasing dependence. As models improve, they increasingly conceal human skill loss.

You automate an increasing amount of coding tasks with AI at work and lose your domain knowledge of the system your working on. Thus it becomes harder to maintain and you must rely on AI even more as your cognitive "muscle" atrophys

- SWEs who have thoughts on this (link related articles)

Fronteir Lab incentives

Labs
OpenAI vs Anhropic

They say x, but do y.

Figure out whats going on in a big company by:
- corporate structure
  - openai non profit -> for profit
- incentives

General Structure
Board elects leaders (enforces contract) -> Managers run company -> maximize return for shareholder

Principle agent theory
Why a CEO must act in the interest of his employers (shareholders)?
If you employed me to cut your yard, and I decided to also do part of the neighbor's yard so that it didn't look strange at the boundary, at your expense, without your approval, how would you feel?
This is a CEO spending your money for general social interest.

But, don't big comapnies care?
Strategic social responsibility (apple fbi vs china icloud)
CSR equities
Regulatory capture

- Milton Friedman (nobel prize winnder) Social Resposnibility of Business
- eleemosynary

Open weight models are better overall, since its easier to run without chained ankles

Does the creative need a model optimized for long horizon coding tasks on an arbitary benchmark?
Does the biological researcher need a model optimized against liability and risk?
Does the software engineer need a model optimized for single task completion, not maintaiability, user value, and taste?
Does the free thinker need a model optimized to approximate the average sentiment?
Does the average person with judgement need a model optimized to redact information that a subset of the population could theoretically misuse?
Does anyone need a model that is optimized for their dependnce, not benefit?

Big labs want a model that:
- AI dependency/cognitive off loading (MUST PROVIDE EXMAPELS FOR EVERY POINT)
  - how ai companies strategically profit off this
  - how they intentionally facilitate this
    - companies drive adoption, habit, dependence for retention which produces revenue (give most horrifying exmaples of meta doing this)
      - screenshot of chatgpt beign RLd to answer follow up quesiton, drive longer convos
    - resulting effect: cognitive deskilling/decline, overrelience, syncophancy, psycological harm
    - dont reloate your brain, your labor force, your therapist, your friend into something that a big tech company is optimizing this way
- Real risk of loss of access/control
- Open Internet vs closed AI
- uses technolocil improvements to increase profit margin

You want a model that:
- is optimized for your domain and preferences
- is aligned with your personal values
which
- lets you exercise judgment over the result
- lets you control your sensitve data
- lets you configure and improve it freely
- lets you imediately reap the benefits of commmunty improvements
whose access is
- protected from big tech financial collapse
- proteted from societal and cultural opinions that you dont agree with
- protected from the sitting administration and its incentives to preserve its own power
