import { describe, expect, it } from "vitest";
import { readBlogPostSource } from "./blog-data";
import { extractToc, nestToc } from "./toc";

describe("nestToc", () => {
  it("nests h3 entries under their nearest h2 and closes branches at the next h2", () => {
    const outline = nestToc([
      { id: "one", text: "One", depth: 2 },
      { id: "one-a", text: "One A", depth: 3 },
      { id: "one-b", text: "One B", depth: 3 },
      { id: "two", text: "Two", depth: 2 },
      { id: "two-a", text: "Two A", depth: 3 }
    ]);

    expect(outline).toEqual([
      {
        id: "one",
        text: "One",
        depth: 2,
        children: [
          { id: "one-a", text: "One A", depth: 3, children: [] },
          { id: "one-b", text: "One B", depth: 3, children: [] }
        ]
      },
      {
        id: "two",
        text: "Two",
        depth: 2,
        children: [{ id: "two-a", text: "Two A", depth: 3, children: [] }]
      }
    ]);
  });

  it("keeps an h3 without a preceding h2 at the root", () => {
    expect(nestToc([{ id: "orphan", text: "Orphan", depth: 3 }])).toEqual([
      { id: "orphan", text: "Orphan", depth: 3, children: [] }
    ]);
  });
});

describe("extractToc", () => {
  it("collects h2/h3 with github-slugger ids", () => {
    const toc = extractToc("## Doctors Can't Keep Up\n\ntext\n\n### More Architecture Decisions\n");
    expect(toc).toEqual([
      { id: "doctors-cant-keep-up", text: "Doctors Can't Keep Up", depth: 2 },
      { id: "more-architecture-decisions", text: "More Architecture Decisions", depth: 3 }
    ]);
  });

  it("ignores headings inside fenced code blocks", () => {
    const toc = extractToc("```bash\n## not a heading\n```\n\n## Real\n");
    expect(toc.map((item) => item.id)).toEqual(["real"]);
  });

  it("numbers duplicate headings the way rehype-slug will", () => {
    const toc = extractToc("## Setup\n\n## Setup\n");
    expect(toc.map((item) => item.id)).toEqual(["setup", "setup-1"]);
  });

  it("strips inline markdown so the text matches the rendered heading", () => {
    const toc = extractToc("## Using `compileMDX` with [links](https://example.com)[^1]\n");
    expect(toc).toEqual([
      { id: "using-compilemdx-with-links", text: "Using compileMDX with links", depth: 2 }
    ]);
  });

  it("skips h1 and h4+ but keeps their slugs reserved", () => {
    const toc = extractToc("# Title\n\n## Title\n\n#### Deep\n");
    // The h2 gets "title-1" because the h1 consumed "title" in rehype-slug too.
    expect(toc).toEqual([{ id: "title-1", text: "Title", depth: 2 }]);
  });

  it("extracts the long-form article's full outline", async () => {
    const { source } = await readBlogPostSource("neural-nets-for-eye-disease");
    const toc = extractToc(source);
    expect(toc.map((item) => item.id)).toEqual([
      "doctors-cant-keep-up",
      "using-math-to-see-disease",
      "implementing-a-cnn-for-eye-disease-classification",
      "more-architecture-decisions",
      "the-code-explained",
      "setup-and-configuration",
      "training-the-model",
      "final-thoughts"
    ]);
  });
});
