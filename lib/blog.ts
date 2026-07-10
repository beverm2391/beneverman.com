import { compileMDX } from "next-mdx-remote/rsc";
import rehypeMermaid from "rehype-mermaid";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import python from "shiki/langs/python.mjs";
import typescript from "shiki/langs/typescript.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import type { Highlighter } from "shiki";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { MdxLink } from "@/components/mdx/mdx-link";
import { Summary } from "@/components/mdx/summary";
import { ZoomImage } from "@/components/mdx/zoom-image";
import {
  includeDrafts,
  readBlogPostSource,
  type BlogPostSummary
} from "@/lib/blog-data";

export {
  formatPostDate,
  getBlogPosts,
  getBlogPostSummary,
  type BlogPostFrontmatter,
  type BlogPostSummary
} from "@/lib/blog-data";

export type BlogPost = BlogPostSummary & {
  content: React.ReactElement;
};

// Besides the bespoke components, MDX primitives are remapped: images get the
// click-to-zoom lightbox, links get internal/external routing, code blocks
// get a copy button.
const mdxComponents = { Callout, Summary, a: MdxLink, img: ZoomImage, pre: CodeBlock };

const highlighterPromise: Promise<HighlighterCore> = createHighlighterCore({
  themes: [githubLight, githubDark],
  langs: [python, typescript, javascript, bash, json],
  engine: createJavaScriptRegexEngine()
});

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  getHighlighter: () => highlighterPromise as Promise<unknown> as Promise<Highlighter>
};

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const { source, frontmatter } = await readBlogPostSource(slug);
  // Drafts must not be reachable in production, even by direct URL; the page
  // catches this and renders notFound().
  if (frontmatter.draft && !includeDrafts) {
    throw new Error(`Post "${slug}" is a draft.`);
  }
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Mermaid runs first so ```mermaid fences become inline SVG at
        // compile time (headless Chromium, no client JS, no flash) before
        // pretty-code touches the remaining fences.
        rehypePlugins: [
          [
            rehypeMermaid,
            {
              strategy: "inline-svg",
              mermaidConfig: { theme: "neutral", fontFamily: "Geist, ui-sans-serif, sans-serif" }
            }
          ],
          [rehypePrettyCode, prettyCodeOptions]
        ]
      }
    }
  });

  return { slug, ...frontmatter, content };
}
