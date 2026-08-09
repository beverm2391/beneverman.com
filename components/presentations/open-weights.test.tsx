import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OpenWeightsPresentation } from "@/components/presentations/open-weights";

describe("open-weight presentation", () => {
  it("opens on its title slide and exposes a second slide", () => {
    const markup = renderToStaticMarkup(<OpenWeightsPresentation />);

    expect(markup).toContain("Open Weight Models: slide 1 of 2");
    expect(markup).toContain("Open-weight models");
    expect(markup).toContain("01 / 02");
    expect(markup).toContain('aria-label="Next slide"');
  });
});
