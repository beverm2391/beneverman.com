import { describe, expect, it } from "vitest";
import { getBlogPostSummary, getBlogPosts } from "./blog-data";

describe("blog content", () => {
  it("loads every committed post through frontmatter validation", async () => {
    const posts = await getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.map((post) => post.date)).toEqual([...posts.map((post) => post.date)].sort().reverse());
  });

  it("excludes drafts from the production post list", async () => {
    const published = await getBlogPosts({ drafts: false });
    expect(published.every((post) => !post.draft)).toBe(true);
    // The styling sandbox is a dev-only draft and must never ship.
    expect(published.map((post) => post.slug)).not.toContain("agent-workshop-notes");
  });

  it("excludes archived posts from every list", async () => {
    const posts = await getBlogPosts({ drafts: true });
    expect(posts.every((post) => !post.archived)).toBe(true);
  });

  it("rejects slugs before they can escape the content directory", async () => {
    await expect(getBlogPostSummary("../PRODUCT")).rejects.toThrow("Invalid blog slug");
  });
});
