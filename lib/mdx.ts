import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
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
import { ChatReplay, ChatReplayComparison } from "@/components/mdx/chat-replay";
import { CodeBlock } from "@/components/mdx/code-block";
import { DrugDevelopmentLoops } from "@/components/mdx/drug-development-loops";
import { MdxLink } from "@/components/mdx/mdx-link";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";
import { Summary } from "@/components/mdx/summary";
import { ZoomImage } from "@/components/mdx/zoom-image";
import { ZoomSvg } from "@/components/mdx/zoom-svg";
import {
  mermaidFontCSS,
  mermaidFontFamily,
  mermaidLaunchOptions,
  mermaidThemeCSS
} from "@/lib/mermaid-theme";

// Besides the bespoke components, MDX primitives are remapped: images and
// compile-time mermaid SVGs get the click-to-zoom lightbox, links get
// internal/external routing, and code blocks get a copy button. This map is
// shared by every first-party MDX surface rather than being blog policy.
const mdxComponents = {
  Callout,
  ChatReplay,
  ChatReplayComparison,
  DrugDevelopmentLoops,
  Presentation,
  PresentationSlide,
  Summary,
  a: MdxLink,
  img: ZoomImage,
  svg: ZoomSvg,
  pre: CodeBlock
};

// One highlighter for the process. Keeping it here makes the expensive,
// server-only compiler reusable without letting individual content types
// create their own Shiki instances.
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

// Local images live in /public, so their intrinsic size is knowable at compile
// time. Stamping width/height lets the browser reserve the box before the bytes
// arrive. CSS keeps them responsive.
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

// Diagram renderers sometimes emit values that are not valid JSX style
// declarations. Browsers ignore them, but MDX's HAST-to-JSX conversion throws.
// Keep only `property: value` declarations and drop undefined values.
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

export async function renderMdx(source: string): Promise<React.ReactElement> {
  // Imported here rather than at module scope on purpose. rehype-mermaid pulls
  // in Playwright; a top-level import drags it into serverless functions where
  // its browser files are not traced. First-party MDX is compiled at build time.
  const { default: rehypeMermaid } = await import("rehype-mermaid");
  const launchOptions = await mermaidLaunchOptions();
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          // Shared heading anchors. The blog TOC mirrors this slug generation
          // from raw source, so its extractor must stay in sync.
          rehypeSlug,
          // Mermaid runs before pretty-code so diagram fences become inline
          // SVG at compile time; remaining fences continue to Shiki.
          [
            rehypeMermaid,
            {
              strategy: "inline-svg",
              css: mermaidFontCSS,
              launchOptions,
              mermaidConfig: {
                theme: "base",
                fontFamily: mermaidFontFamily,
                themeCSS: mermaidThemeCSS
              }
            }
          ],
          // Math is parsed from $inline$ and $$display$$ LaTeX by remark-math,
          // then rendered to accessible MathML + KaTeX HTML at compile time.
          // No client-side JavaScript is needed.
          rehypeKatex,
          rehypeSanitizeStyleAttributes,
          rehypeLocalImageDimensions,
          [rehypePrettyCode, prettyCodeOptions]
        ]
      }
    }
  });

  return content;
}
