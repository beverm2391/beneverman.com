import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OpenWeightsPresentation } from "@/components/presentations/open-weights";

describe("open-weight presentation", () => {
  it("opens on its title slide with navigation to further slides", () => {
    const markup = renderToStaticMarkup(<OpenWeightsPresentation />);

    // The deck is under active authoring, so assert the deck shell rather
    // than pinning the slide count.
    expect(markup).toMatch(/Open Weight Models: slide 1 of \d+/);
    expect(markup).toContain("Open-weight models");
    expect(markup).toMatch(/01 \/ \d{2}/);
    expect(markup).toContain('aria-label="Next slide"');
  });
});
