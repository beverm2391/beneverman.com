# 11, the engine-to-you stack

For the `stack-engine-to-you` dive under the how-do-you-start poll slide.
Ben presents TONIGHT (Aug 12, ~8pm); if the figure lands before ~7:30 it
goes on the slide, otherwise the text bullets carry it and the figure joins
the published post. Style contract in `00-style-contract.md`.

## What the viewer must understand

The thing you type into is not the thing that thinks. There are layers, and
the layers are swappable. Ben's chain, bottom to top:

engine (runs the model weights, produces text) → text → harness (turns the
text into a chat or an agent: ChatGPT app, Claude Code, pi) → you.

The argument the figure carries: any harness can point at any engine. Keep
the harness you already like, swap what is behind it — a hosted provider,
OpenRouter, or your own laptop.

## What to draw

A vertical (or gently diagonal) stack of three bands with the person at top:

1. Bottom band: the engine, drawn as machinery holding a weights file.
   Label ENGINE with small annotations (llama.cpp, MLX, vLLM as examples).
2. Middle: text flowing upward from engine to harness.
3. Top band: the harness as the familiar chat window / terminal shape.
   Label HARNESS (examples: ChatGPT, Claude Code, pi).
4. The person above, talking to the harness only.

The swap gesture is the point: beside the engine band, show two or three
alternative engine blocks (a cloud provider, OpenRouter, your laptop) with
an arrow or socket indicating any of them can plug into the same harness.
One accent-colored callout: the harness stays, the model behind it swaps.

Do not draw brand logos; words are enough. Keep the person-harness contact
visually simple — the viewer should see at a glance that the user never
touches the engine.
