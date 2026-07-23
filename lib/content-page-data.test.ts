import { describe, expect, it } from "vitest";
import { readContentPageSource } from "./content-page-data";

describe("standalone content pages", () => {
  it("discovers the committed Direction page from its own content source", async () => {
    const source = await readContentPageSource("direction");

    expect(source).toContain("technology company and research organization");
    expect(source).toContain("not a ten-year roadmap");
  });

  it("rejects slugs before they can escape the content directory", async () => {
    await expect(readContentPageSource("../PRODUCT")).rejects.toThrow(
      "Invalid content page slug"
    );
  });
});
