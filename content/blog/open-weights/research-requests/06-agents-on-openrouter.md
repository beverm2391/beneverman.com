# Research 06, coding agents on OpenRouter

Feeds the `how-hosted` slide, which currently claims: "Point Claude Code,
Codex, or pi at it. Same workflow, fraction of the cost." Ben says this on
stage TONIGHT (Aug 12, ~8pm), possibly to a room containing people who will
try it tomorrow, so the claim must be load-bearing: what actually works,
what is fiddly, what is false. Findings before ~7pm are usable for the talk.

## Deliverables

1. **Claude Code → OpenRouter (or any OpenAI-compatible endpoint).** Is it
   actually supported? Cover `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN`
   env-var overrides, OpenRouter's Anthropic-compatible endpoint if one
   exists, and community shims/proxies (e.g. claude-code-router or
   LiteLLM-style proxies). What breaks: tool use, streaming, context caching?
2. **Codex CLI → OpenRouter.** Same questions. Codex CLI is open source and
   documented to support custom providers/base URLs; verify the exact config
   (`~/.codex/config.toml` provider blocks or equivalent) and which open
   models actually complete agentic tasks with it.
3. **pi → OpenRouter.** Verify current pi provider config support.
4. **Which open models hold up as the backend.** Community consensus
   2025-2026 on the best OpenRouter-served open models for coding agents
   (Kimi K3, DeepSeek V4, Qwen coder variants): which ones handle tool
   calling reliably, rough $/Mtok, and honest failure modes.
5. **The honest one-liner.** For each agent: "works out of the box",
   "works with a config file", "needs a proxy shim", or "does not work".
   That summary drives whether the slide bullet stays, softens, or names
   specific agents only.

## Output

- Exact config snippets with sources (official docs, repo READMEs, dated
  community writeups). Mark anything version-fragile with the version.
- Append findings to this file; Ben reads before anything is cited.
- Lead the findings with the three one-liners from deliverable 5.

## Findings, delivered August 12, 2026 (resource packet, via Ben)

Headlines for the deck:

- **Hosted, one command:** OpenRouter's Ori harness configures Claude Code,
  Codex, and pi in one command (openrouter.ai/ori/harness). Caveat: new
  closed binary, telemetry on by default (`ORI_TELEMETRY=0`). Manual
  fallbacks exist per harness: Codex `config.toml` cookbook, Claude Code
  `ANTHROPIC_BASE_URL` cookbook, pi native `/login openrouter`.
- **Local, one command:** Ollama officially integrates all three:
  `ollama launch claude`, `ollama launch codex`, `ollama launch pi`.
  Ollama built an Anthropic-compatible API specifically so Claude Code
  works; generic OpenAI-compatible servers do NOT support Claude Code.
  LM Studio covers Codex/pi via its OpenAI-compatible `/v1` endpoint.
- **Hosted model picks:** Qwen3 Coder Next (262K ctx, $0.12/$0.80 per Mtok),
  Kimi K2.7 Code (serious option), DeepSeek V3.1 Terminus (cheap general).
  Recheck the live catalog (openrouter.ai/api/v1/models) before presenting.
- **Mac pairs:** >32GB Apple Silicon → Qwen3.5 35B-A3B coding NVFP4 (22GB,
  Ollama's official MLX Mac recipe); 16GB-class → Qwen3.5 9B (6.6GB Q4_K_M,
  small-model expectations); Devstral Small 2505 24B Q4 (~14GB) as the
  pinned alternative (`24b-small-2505-q4_K_M`, not `latest`).
- **Gaming-PC pairs (GGUF Q4_K_M):** 8GB VRAM → Qwen2.5-Coder 7B;
  12-16GB → 14B; 24-32GB → 32B (official GGUF path is 32K context, do not
  claim 128K) or Devstral Small 2507.
- **Known caveat to test before any live demo:** an open Ollama issue
  reports raw chat-completions reasoning problems on M5 Max; the official
  launch paths were unaffected.

The full link packet (engines, quantization references, tool-calling
caveats, KB models) is preserved below.

### Hosted models in existing harnesses

- [OpenRouter Ori Harness](https://openrouter.ai/ori/harness) — one-command
  configuration for Claude Code, Codex, and pi.
- [Ori installation script](https://openrouter.ai/labs/ori/install.sh) —
  inspectable source; telemetry on by default, `ORI_TELEMETRY=0` disables.
- [Ori launch announcement](https://openrouter.ai/blog/announcements/ori-harness/)
- [OpenRouter → Codex guide](https://openrouter.ai/docs/cookbook/coding-agents/codex-cli)
- [OpenRouter → Claude Code guide](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration)
- [pi provider documentation](https://pi.dev/docs/latest/providers)
- [Qwen3 Coder Next on OpenRouter](https://openrouter.ai/qwen/qwen3-coder-next)
- [Kimi K2.7 Code on OpenRouter](https://openrouter.ai/moonshotai/kimi-k2.7-code)
- [DeepSeek V3.1 Terminus on OpenRouter](https://openrouter.ai/deepseek/deepseek-v3.1-terminus)
- [OpenRouter live model catalog](https://openrouter.ai/api/v1/models)

### Local models in existing harnesses

- [Ollama → Claude Code](https://docs.ollama.com/integrations/claude-code)
- [Ollama → Codex CLI](https://docs.ollama.com/integrations/codex)
- [Ollama → Codex app](https://docs.ollama.com/integrations/codex-app)
- [Ollama → pi](https://docs.ollama.com/integrations/pi)
- [LM Studio OpenAI compatibility](https://lmstudio.ai/docs/developer/openai-compat)
- [LM Studio local server](https://lmstudio.ai/docs/developer/core/server)
- [LM Studio → Codex integration](https://lmstudio.ai/docs/integrations/codex)

### Mac resources and model artifacts

- [Ollama MLX on Apple Silicon](https://ollama.com/blog/mlx) — official
  Claude Code command, >32GB requirement, M5 performance charts.
- [Qwen3.5 35B-A3B coding NVFP4](https://ollama.com/library/qwen3.5:35b-a3b-coding-nvfp4) — 22GB.
- [Qwen3.5 9B](https://ollama.com/library/qwen3.5:9b) — 6.6GB Q4_K_M.
- [Devstral tags on Ollama](https://ollama.com/library/devstral/tags)
- [Devstral Small 2505 GGUF](https://huggingface.co/mistralai/Devstral-Small-2505_gguf)
- [Ollama Qwen coding issue](https://github.com/ollama/ollama/issues/16780)

### Gaming-PC model artifacts

- [Qwen2.5-Coder 7B GGUF](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF)
- [Qwen2.5-Coder 14B GGUF](https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF)
- [Qwen2.5-Coder 32B GGUF](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF)
- [Devstral Small 2507 GGUF](https://huggingface.co/mistralai/Devstral-Small-2507_gguf)
- KB models, not defaults: [Ornith 1.0 35B](https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B),
  [BTL-4 Compact](https://huggingface.co/badtheorylabs/BTL-4-Compact),
  [Qwopus 3.6 35B coding GGUF](https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder-MTP-GGUF)

### Hugging Face and quantization references

- [HF GGUF overview](https://huggingface.co/docs/hub/en/gguf) ·
  [HF → llama.cpp](https://huggingface.co/docs/hub/en/gguf-llamacpp) ·
  [HF → LM Studio](https://huggingface.co/docs/hub/en/lmstudio) ·
  [HF → Ollama](https://huggingface.co/docs/hub/en/ollama)
- [Quantization from the ground up](https://ngrok.com/blog/quantization) —
  near-lossless at 8-bit, usable at 4-bit, severe at 2-bit.
- [Qwen3.5 quantization comparison](https://kaitchup.substack.com/p/qwen35-quantization-similar-accuracy) —
  27B INT4 beats 9B full-precision in ~16GB.
- [llama.cpp quantize docs](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md) ·
  [llama.cpp function calling](https://github.com/ggml-org/llama.cpp/blob/master/docs/function-calling.md) ·
  [LM Studio tool use](https://lmstudio.ai/docs/developer/openai-compat/tools)
- [Tool Eval Bench](https://github.com/SeraphimSerapis/tool-eval-bench) ·
  [Qwen fixed chat templates](https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates)

### Inference-engine references

- [llama.cpp](https://github.com/ggml-org/llama.cpp) ·
  [MLX](https://github.com/ml-explore/mlx) / [mlx-lm](https://github.com/ml-explore/mlx-lm) ·
  [ExLlamaV3](https://github.com/turboderp-org/exllamav3) ·
  [vLLM](https://docs.vllm.ai/) · [SGLang](https://docs.sglang.ai/) ·
  [Transformers](https://huggingface.co/docs/transformers/) ·
  [TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/)
- KB deep dives: [Inside vLLM](https://www.aleksagordic.com/blog/vllm) ·
  [Inference Engineering](https://www.baseten.co/inference-engineering/)
