import {
  createPublicationCollection,
  formatPublicationDate,
  includeDrafts,
  publicationFrontmatterSchema,
  type PublicationFrontmatter,
  type PublicationListOptions,
  type PublicationSummary
} from "@/lib/publication-data";

const blog = createPublicationCollection({
  label: "blog"
});

export const frontmatterSchema = publicationFrontmatterSchema;
export const formatPostDate = formatPublicationDate;
export { includeDrafts };

export type BlogPostFrontmatter = PublicationFrontmatter;
export type BlogPostSummary = PublicationSummary;

export const readBlogPostSource = blog.readSource;
export const getBlogPostSummary = blog.getSummary;

export function getBlogPosts(options?: PublicationListOptions) {
  return blog.getAll(options);
}
