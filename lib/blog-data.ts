import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const blogDirectory = path.join(process.cwd(), "content/blog");
const allowedSlug = /^[a-z0-9-]+$/;

// Drafts render locally and on Vercel previews — a preview exists to look at
// unfinished work, and it is auth-gated and noindex, so nothing leaks. Only the
// production deploy hides them. This also keeps previews honest about the build:
// a draft that fails to compile fails the preview instead of waiting to surface
// on the day it ships.
export const includeDrafts =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date().transform((date) => date.toISOString().slice(0, 10)),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  // One field rather than draft/archived booleans, which allowed a fourth state
  // that means nothing. What separates these is what the URL does:
  //
  //   draft      unfinished. Renders locally and on previews; in production it
  //              is absent from every list and getBlogPost throws, so the slug
  //              404s. It was never public, so there is nothing to redirect.
  //   published  live.
  //   archived   was published and is withdrawn. Absent from every list in
  //              every environment, but the slug still redirects to /blog (see
  //              the post page) because inbound links to it exist. Frontmatter
  //              drives that, so there are no hardcoded redirects in
  //              next.config.
  //
  // Defaulting to draft means a new post ships only when it says so. The
  // reverse default once left a deliberately retired post live.
  status: z.enum(["draft", "published", "archived"]).default("draft")
});

export type BlogPostFrontmatter = z.infer<typeof frontmatterSchema>;

export type BlogPostSummary = BlogPostFrontmatter & {
  slug: string;
};

const postDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export function formatPostDate(date: string) {
  return postDateFormat.format(new Date(date));
}

function parseFrontmatter(slug: string, data: unknown) {
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter for "${slug}": ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function readBlogPostSource(slug: string) {
  if (!allowedSlug.test(slug)) throw new Error(`Invalid blog slug "${slug}".`);

  const source = await fs.readFile(path.join(blogDirectory, `${slug}.mdx`), "utf8");
  const parsed = matter(source);
  return {
    source: parsed.content,
    frontmatter: parseFrontmatter(slug, parsed.data)
  };
}

export async function getBlogPostSummary(slug: string): Promise<BlogPostSummary> {
  const { frontmatter } = await readBlogPostSource(slug);
  return { slug, ...frontmatter };
}

export async function getBlogPosts(
  // Overridable so tests can assert the production (drafts-excluded) list
  // without stubbing NODE_ENV.
  { drafts = includeDrafts }: { drafts?: boolean } = {}
): Promise<BlogPostSummary[]> {
  const filenames = (await fs.readdir(blogDirectory))
    .filter((entry) => entry.endsWith(".mdx"))
    .sort();
  const posts = await Promise.all(
    filenames.map((filename) => getBlogPostSummary(filename.replace(/\.mdx$/, "")))
  );
  return posts
    .filter((post) => post.status === "published" || (drafts && post.status === "draft"))
    .sort((a, b) => b.date.localeCompare(a.date));
}
