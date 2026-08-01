import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderMdx } from "./mdx";

describe("shared MDX renderer", () => {
  it("preserves headings, GFM, links, and highlighted code", async () => {
    const content = await renderMdx(`
## Shared pipeline

| Surface | Source |
| --- | --- |
| Direction | MDX |

[Direction](/direction)

\`\`\`ts
const shared: boolean = true;
\`\`\`
`);
    const markup = renderToStaticMarkup(content);

    expect(markup).toContain('id="shared-pipeline"');
    expect(markup).toContain("<table>");
    expect(markup).toContain('href="/direction"');
    expect(markup).toContain('data-language="ts"');
    expect(markup).toContain('aria-label="Copy code"');
  });

  it("renders inline and display LaTeX with KaTeX", async () => {
    const content = await renderMdx(String.raw`
Inline math: $E = mc^2$.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
`);
    const markup = renderToStaticMarkup(content);

    expect(markup).toContain('class="katex"');
    expect(markup).toContain('class="katex-display"');
    expect(markup).toContain("<math");
    expect(markup).not.toContain("$E = mc^2$");
  });

  it("registers chat replay components for every MDX surface", async () => {
    const content = await renderMdx(`
<ChatReplayComparison synchronized className="content-breakout">
  <ChatReplay src="/replays/sky-concise.jsonl" label="Concise" />
  <ChatReplay src="/replays/sky-detailed.jsonl" label="Detailed" />
</ChatReplayComparison>
`);
    const markup = renderToStaticMarkup(content);

    expect(markup).toContain("Concise");
    expect(markup).toContain("Detailed");
    expect(markup).toContain("Loading conversation");
    expect(markup).toContain("content-breakout");
  });
});
