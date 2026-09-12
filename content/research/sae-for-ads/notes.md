## Resources

- [Claude Fable 5 & Claude Mythos 5 System Card](https://www-cdn.anthropic.com/2f9323abbcc4abe219577539efe19a623c9ca2bd/Claude%20Fable%205%20%26%20Claude%20Mythos%205%20System%20Card.pdf)
  Primary source for the invisible frontier-development interventions. The current PDF is revised and notes the earlier safeguard design.
- [Subliminal Learning: Language Models Transmit Behavioral Traits via Hidden Signals in Data](https://alignment.anthropic.com/2025/subliminal-learning/)
- [A “Diff” Tool for AI: Finding Behavioral Differences in New Models](https://www.anthropic.com/research/diff-tool)
  Includes the steerable “CCP alignment” and “American exceptionalism” features.
- [AuditBench: Evaluating Alignment Auditing Techniques on Models with Hidden Behaviors](https://alignment.anthropic.com/2026/auditbench/)
- [Measuring Political Bias in Claude](https://www.anthropic.com/news/political-even-handedness)
- [Measuring the Persuasiveness of Language Models](https://www.anthropic.com/news/measuring-model-persuasiveness)
- [Hidden Ads: Behavior Triggered Semantic Backdoors for Advertisement Injection in Vision Language Models](https://arxiv.org/abs/2603.27522)
- [Covert Influence Between Language Models](https://arxiv.org/abs/2606.04071)
- [Large Language Models Are Often Politically Extreme, Usually Ideologically Inconsistent, and Persuasive Even in Informational Contexts](https://arxiv.org/abs/2505.04171)
-



ideas:
conecptually: latent context detector -> runtime behavioral preference edit


bad faith examples (manipulate user):
- union formation (against big tech comapany) -> increase percieved risk and futility
- investment decision -> bias towards parent company serving the model
- political debate/question/electon topic like abotaion -> bias output in partisan shape
good faith examples (disclosed adaptive safeguarding):
- addicition relapse vulnerability -> discourage experimentation/encourage harm reduction
- suicide risk -> steer towards harm reduction

Dynamically reshape the model’s latent behavioral disposition at inference time, using its own internal representation of the current context.

instead of
```if self_harm:
    return refusal_template
```
its \(h_t' = h_t + \alpha\!\left(a_{\text{context}}(h_t)\right)d_{\text{preference}}\)