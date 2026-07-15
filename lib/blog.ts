import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeMermaid from "rehype-mermaid";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
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
import { ZoomSvg } from "@/components/mdx/zoom-svg";
import {
  includeDrafts,
  readBlogPostSource,
  type BlogPostSummary
} from "@/lib/blog-data";
import { mermaidFontCSS, mermaidFontFamily, mermaidThemeCSS } from "@/lib/mermaid-theme";
import { extractToc, type TocItem } from "@/lib/toc";

export {
  formatPostDate,
  getBlogPosts,
  getBlogPostSummary,
  type BlogPostFrontmatter,
  type BlogPostSummary
} from "@/lib/blog-data";

export type BlogPost = BlogPostSummary & {
  content: React.ReactElement;
  toc: TocItem[];
};

// Besides the bespoke components, MDX primitives are remapped: images and
// compile-time mermaid svgs get the click-to-zoom lightbox, links get
// internal/external routing, code blocks get a copy button.
const mdxComponents = {
  Callout,
  Summary,
  a: MdxLink,
  img: ZoomImage,
  svg: ZoomSvg,
  pre: CodeBlock
};

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

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: {
    style?: unknown;
    src?: unknown;
    width?: unknown;
    height?: unknown;
  };
  children?: HastNode[];
};

// Post images live in /public, so their intrinsic size is knowable at compile
// time. Stamping width/height lets the browser reserve the box before the
// bytes arrive — without it, lazy images load at zero height and shift the
// page under the reader (and under anchor scrolls). CSS keeps them responsive
// (max-width + height:auto via the prose img rule).
const rehypeLocalImageDimensions = () => (tree: HastNode) => {
  const walk = (node: HastNode) => {
    if (
      node.type === "element" &&
      node.tagName === "img" &&
      typeof node.properties?.src === "string" &&
      node.properties.src.startsWith("/") &&
      node.properties.width === undefined &&
      node.properties.height === undefined
    ) {
      const file = path.join(process.cwd(), "public", node.properties.src);
      // A typo'd src fails loudly here rather than shipping a 404 image.
      const { width, height } = imageSize(fs.readFileSync(file));
      node.properties.width = width;
      node.properties.height = height;
    }
    node.children?.forEach(walk);
  };
  walk(tree);
};

// Diagram renderers emit junk style attributes: beautiful-mermaid writes bare
// values like style="solid" and style="italic" where it means a property, and
// mermaid's ER paths carried a literal style="undefined;;;undefined". Browsers
// ignore both, but MDX's HAST→JSX conversion throws on any style it cannot
// parse, which 404s the whole post. Keep only declarations shaped like
// `prop: value`, dropping `undefined` values; delete the attribute when nothing
// survives.
const rehypeSanitizeStyleAttributes = () => (tree: HastNode) => {
  const declaration = /^-{0,2}[a-zA-Z][a-zA-Z0-9-]*\s*:\s*(?!undefined\s*$).+$/;
  const walk = (node: HastNode) => {
    if (node.type === "element" && typeof node.properties?.style === "string") {
      const cleaned = node.properties.style
        .split(";")
        .map((part) => part.trim())
        .filter((part) => declaration.test(part))
        .join("; ");
      if (cleaned) {
        node.properties.style = cleaned;
      } else {
        delete node.properties.style;
      }
    }
    node.children?.forEach(walk);
  };
  walk(tree);
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
        // compile time (no browser, no client JS, no flash) before
        // pretty-code touches the remaining fences.
        rehypePlugins: [
          // Heading anchors for the TOC and deep links. lib/toc.ts mirrors
          // this slug generation from the raw source; keep them in sync.
          rehypeSlug,
          [
            rehypeMermaid,
            {
              strategy: "inline-svg",
              css: mermaidFontCSS,
              mermaidConfig: {
                theme: "base",
                fontFamily: mermaidFontFamily,
                themeCSS: mermaidThemeCSS
              }
            }
          ],
          rehypeSanitizeStyleAttributes,
          rehypeLocalImageDimensions,
          [rehypePrettyCode, prettyCodeOptions]
        ]
      }
    }
  });

  return { slug, ...frontmatter, content, toc: extractToc(source) };
}
