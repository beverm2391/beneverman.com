import {
  createPublicationCollection,
  includeDrafts,
  type PublicationFrontmatter,
  type PublicationListOptions,
  type PublicationSummary
} from "@/lib/publication-data";

const research = createPublicationCollection({
  label: "research"
});

const researchDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export function formatResearchDate(date: string) {
  return researchDateFormat.format(new Date(date));
}
export { includeDrafts };

export type ResearchFrontmatter = PublicationFrontmatter;
export type ResearchSummary = PublicationSummary;

export const readResearchSource = research.readSource;
export const getResearchSummary = research.getSummary;

export function getResearchPublications(options?: PublicationListOptions) {
  return research.getAll(options);
}
