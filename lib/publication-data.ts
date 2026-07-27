import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const allowedSlug = /^[a-z0-9-]+$/;

// Drafts render locally and on auth-gated Vercel previews. Production hides
// them from indexes and direct URLs. Both Blog and Research use this policy so
// publishing cannot mean different things on two parts of the same site.
export const includeDrafts =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

export const publicationFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date().transform((date) => date.toISOString().slice(0, 10)),
  updated: z.coerce
    .date()
    .transform((date) => date.toISOString().slice(0, 10))
    .optional(),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  // Defaulting to draft makes publication explicit. Archived content remains
  // addressable to its route, which decides where old inbound links redirect.
  status: z.enum(["draft", "published", "archived"]).default("draft")
});

export type PublicationFrontmatter = z.infer<typeof publicationFrontmatterSchema>;

export type PublicationSummary = PublicationFrontmatter & {
  slug: string;
};

export type PublicationListOptions = {
  drafts?: boolean;
  archived?: boolean;
};

const publicationDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export function formatPublicationDate(date: string) {
  return publicationDateFormat.format(new Date(date));
}

export function createPublicationCollection({
  label
}: {
  label: "blog" | "research";
}) {
  // Keep both roots statically visible to Turbopack. A caller-provided path
  // makes its file tracer conservatively include the whole repository.
  const contentDirectory =
    label === "blog"
      ? path.join(process.cwd(), "content/blog")
      : path.join(process.cwd(), "content/research");

  function parseFrontmatter(slug: string, data: unknown) {
    const parsed = publicationFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter for "${slug}": ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async function readSource(slug: string) {
    if (!allowedSlug.test(slug)) {
      throw new Error(`Invalid ${label} slug "${slug}".`);
    }

    const source = await fs.readFile(path.join(contentDirectory, `${slug}.mdx`), "utf8");
    const parsed = matter(source);
    return {
      source: parsed.content,
      frontmatter: parseFrontmatter(slug, parsed.data)
    };
  }

  async function getSummary(slug: string): Promise<PublicationSummary> {
    const { frontmatter } = await readSource(slug);
    return { slug, ...frontmatter };
  }

  async function getAll({
    drafts = includeDrafts,
    archived = false
  }: PublicationListOptions = {}): Promise<PublicationSummary[]> {
    const filenames = (await fs.readdir(contentDirectory))
      .filter((entry) => entry.endsWith(".mdx"))
      .sort();
    const publications = await Promise.all(
      filenames.map((filename) => getSummary(filename.replace(/\.mdx$/, "")))
    );

    return publications
      .filter(
        (publication) =>
          publication.status === "published" ||
          (drafts && publication.status === "draft") ||
          (archived && publication.status === "archived")
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  return { readSource, getSummary, getAll };
}
