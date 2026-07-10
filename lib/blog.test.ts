import { describe, expect, it } from "vitest";
import { getBlogPostSummary, getBlogPosts } from "./blog-data";

describe("blog content", () => {
  it("loads every committed post through frontmatter validation", async () => {
    const posts = await getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.map((post) => post.slug)).not.toContain("agent-workshop-notes");
    expect(posts.map((post) => post.date)).toEqual([...posts.map((post) => post.date)].sort().reverse());
  });

  it("rejects slugs before they can escape the content directory", async () => {
    await expect(getBlogPostSummary("../PRODUCT")).rejects.toThrow("Invalid blog slug");
  });
});
