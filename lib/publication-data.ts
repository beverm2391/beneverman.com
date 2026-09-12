import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export type PublicationLabel = "blog" | "research";

const allowedSlug = /^[a-z0-9-]+$/;

export function assertPublicationSlug(label: PublicationLabel, slug: string) {
  if (!allowedSlug.test(slug)) {
    throw new Error(`Invalid ${label} slug "${slug}".`);
  }
}

// Keep both roots statically visible to Turbopack. A caller-provided path
// makes its file tracer conservatively include the whole repository.
export function publicationDirectory(label: PublicationLabel) {
  return label === "blog"
    ? path.join(process.cwd(), "content/blog")
    : path.join(process.cwd(), "content/research");
}

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

export function createPublicationCollection({ label }: { label: PublicationLabel }) {
  const contentDirectory = publicationDirectory(label);

  function parseFrontmatter(slug: string, data: unknown) {
    const parsed = publicationFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter for "${slug}": ${parsed.error.message}`);
    }
    return parsed.data;
  }

  // A publication is `{slug}.mdx`, or `{slug}/index.mdx` when it owns code,
  // notes, or request queues. The folder form keeps a post's bespoke material
  // beside the post instead of scattered through the system directories. Its
  // components load separately, in lib/publication-components.ts, so this
  // module stays data-only for the metadata and feed routes.
  async function readSource(slug: string) {
    assertPublicationSlug(label, slug);

    const folderPath = path.join(contentDirectory, slug, "index.mdx");
    const filePath = path.join(contentDirectory, `${slug}.mdx`);
    const source = await fs.readFile(folderPath, "utf8").catch(() => fs.readFile(filePath, "utf8"));
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
    const entries = await fs.readdir(contentDirectory, { withFileTypes: true });
    const slugs = await Promise.all(
      entries.map(async (entry) => {
        if (entry.isFile() && entry.name.endsWith(".mdx")) {
          return entry.name.replace(/\.mdx$/, "");
        }
        if (entry.isDirectory()) {
          const isPost = await fs
            .access(path.join(contentDirectory, entry.name, "index.mdx"))
            .then(() => true, () => false);
          if (isPost) return entry.name;
        }
        return null;
      })
    );
    const publications = await Promise.all(
      slugs
        .filter((slug): slug is string => slug !== null)
        .sort()
        .map((slug) => getSummary(slug))
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
