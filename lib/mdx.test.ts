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
});
