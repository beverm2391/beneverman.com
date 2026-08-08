import { describe, expect, it } from "vitest";
import { readContentPageSource } from "./content-page-data";

describe("standalone content pages", () => {
  it("discovers the committed Direction page from its own content source", async () => {
    const source = await readContentPageSource("direction");

    // This proves the route's source exists without making Ben's current
    // editorial copy part of the content-loading contract.
    expect(source.trim().length).toBeGreaterThan(0);
  });

  it("rejects slugs before they can escape the content directory", async () => {
    await expect(readContentPageSource("../PRODUCT")).rejects.toThrow(
      "Invalid content page slug"
    );
  });
});
