import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const blogDirectory = path.join(process.cwd(), "content/blog");
const allowedSlug = /^[a-z0-9-]+$/;

const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date().transform((date) => date.toISOString().slice(0, 10)),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).default([])
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

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  const filenames = (await fs.readdir(blogDirectory))
    .filter((entry) => entry.endsWith(".mdx"))
    .sort();
  const posts = await Promise.all(
    filenames.map((filename) => getBlogPostSummary(filename.replace(/\.mdx$/, "")))
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}
