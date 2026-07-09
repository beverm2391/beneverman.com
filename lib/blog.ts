import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import python from "shiki/langs/python.mjs";
import typescript from "shiki/langs/typescript.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import type { Highlighter } from "shiki";
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

export type BlogPost = BlogPostSummary & {
  content: React.ReactElement;
};

const highlighterPromise: Promise<HighlighterCore> = createHighlighterCore({
  themes: [githubLight],
  langs: [python, typescript, javascript, bash, json],
  engine: createJavaScriptRegexEngine()
});

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-light",
  keepBackground: false,
  getHighlighter: () => highlighterPromise as Promise<unknown> as Promise<Highlighter>
};

async function getPostFilenames() {
  const entries = await fs.readdir(blogDirectory);

  return entries.filter((entry) => entry.endsWith(".mdx")).sort();
}

function getSlugFromFilename(filename: string) {
  return filename.replace(/\.mdx$/, "");
}

function parseFrontmatter(slug: string, data: unknown) {
  const parsed = frontmatterSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid frontmatter for "${slug}": ${parsed.error.message}`);
  }

  return parsed.data;
}

async function readPostFile(slug: string) {
  if (!allowedSlug.test(slug)) {
    throw new Error(`Invalid blog slug "${slug}".`);
  }

  const filePath = path.join(blogDirectory, `${slug}.mdx`);
  const source = await fs.readFile(filePath, "utf8");
  const parsed = matter(source);

  return {
    source: parsed.content,
    frontmatter: parseFrontmatter(slug, parsed.data)
  };
}

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  const filenames = await getPostFilenames();
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const slug = getSlugFromFilename(filename);
      const { frontmatter } = await readPostFile(slug);

      return {
        slug,
        ...frontmatter
      };
    })
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const { source, frontmatter } = await readPostFile(slug);
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]]
      }
    }
  });

  return {
    slug,
    ...frontmatter,
    content
  };
}
