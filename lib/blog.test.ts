import { describe, expect, it } from "vitest";
import { frontmatterSchema, getBlogPostSummary, getBlogPosts } from "./blog-data";

describe("blog content", () => {
  it("loads every committed post through frontmatter validation", async () => {
    const posts = await getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.map((post) => post.date)).toEqual([...posts.map((post) => post.date)].sort().reverse());
  });

  it("excludes drafts from the production post list", async () => {
    const published = await getBlogPosts({ drafts: false });
    expect(published.every((post) => post.status === "published")).toBe(true);
    // The styling sandbox is a dev-only draft and must never ship.
    expect(published.map((post) => post.slug)).not.toContain("agent-workshop-notes");
  });

  it("excludes archived posts from every list", async () => {
    const posts = await getBlogPosts({ drafts: true });
    expect(posts.every((post) => post.status !== "archived")).toBe(true);
    // Withdrawn rather than unwritten: the post page redirects this slug to
    // /blog rather than 404ing it, so it must not simply vanish from the repo.
    expect(await getBlogPostSummary("minimalist-ai-agent")).toMatchObject({
      status: "archived"
    });
  });

  it("defaults to draft so a new post never ships by accident", () => {
    // The reverse default once left a deliberately retired post live in the
    // production set. Frontmatter that omits status must not publish.
    const parsed = frontmatterSchema.parse({
      title: "Untitled",
      date: "2026-01-01",
      description: "No status field."
    });
    expect(parsed.status).toBe("draft");
  });

  it("rejects slugs before they can escape the content directory", async () => {
    await expect(getBlogPostSummary("../PRODUCT")).rejects.toThrow("Invalid blog slug");
  });
});
