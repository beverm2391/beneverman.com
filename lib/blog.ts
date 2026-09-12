import {
  includeDrafts,
  readBlogPostSource,
  type BlogPostSummary
} from "@/lib/blog-data";
import { renderMdx } from "@/lib/mdx";
import { loadBlogPostComponents } from "@/lib/publication-components";
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

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const { source, frontmatter } = await readBlogPostSource(slug);
  // Drafts must not be reachable in production, even by direct URL; the page
  // catches this and renders notFound().
  if (frontmatter.status === "draft" && !includeDrafts) {
    throw new Error(`Post "${slug}" is a draft.`);
  }
  const content = await renderMdx(source, await loadBlogPostComponents(slug));

  return { slug, ...frontmatter, content, toc: extractToc(source) };
}
