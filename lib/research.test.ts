import { describe, expect, it } from "vitest";
import {
  getResearchPublications,
  getResearchSummary
} from "./research-data";

describe("research content", () => {
  it("discovers and validates research publications", async () => {
    const publications = await getResearchPublications({ drafts: true });
    expect(publications.map((publication) => publication.slug)).toContain(
      "compounding-drug-development"
    );
  });

  it("excludes drafts from the production publication list", async () => {
    const publications = await getResearchPublications({ drafts: false });
    expect(publications.every((publication) => publication.status === "published")).toBe(true);
    expect(publications.map((publication) => publication.slug)).not.toContain(
      "compounding-drug-development"
    );
  });

  it("rejects slugs before they can escape the research directory", async () => {
    await expect(getResearchSummary("../PRODUCT")).rejects.toThrow(
      "Invalid research slug"
    );
  });
});
