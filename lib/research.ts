import {
  includeDrafts,
  readResearchSource,
  type ResearchSummary
} from "@/lib/research-data";
import { renderMdx } from "@/lib/mdx";
import { extractToc, type TocItem } from "@/lib/toc";

export {
  formatResearchDate,
  getResearchPublications,
  getResearchSummary,
  type ResearchFrontmatter,
  type ResearchSummary
} from "@/lib/research-data";

export type ResearchPublication = ResearchSummary & {
  content: React.ReactElement;
  toc: TocItem[];
};

export async function getResearchPublication(slug: string): Promise<ResearchPublication> {
  const { source, frontmatter } = await readResearchSource(slug);
  if (frontmatter.status === "draft" && !includeDrafts) {
    throw new Error(`Research publication "${slug}" is a draft.`);
  }
  const content = await renderMdx(source);

  return { slug, ...frontmatter, content, toc: extractToc(source) };
}
