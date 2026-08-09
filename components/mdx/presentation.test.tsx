import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Presentation, PresentationSlide } from "@/components/mdx/presentation";

describe("presentation", () => {
  it("renders one embedded slide with its controls", () => {
    const markup = renderToStaticMarkup(
      <Presentation label="Component proof">
        <PresentationSlide>Placeholder one</PresentationSlide>
        <PresentationSlide>Placeholder two</PresentationSlide>
      </Presentation>
    );

    expect(markup).toContain("Component proof: slide 1 of 2");
    expect(markup).toContain("Placeholder one");
    expect(markup).not.toContain("Placeholder two");
    expect(markup).toContain('aria-label="Next slide"');
    // Embedded view offers theater by default; display fullscreen is the
    // ⌘-click variant of the same control.
    expect(markup).toContain("Present in the browser window");
    expect(markup).not.toContain('tabindex="0"');
  });

  it("renders nothing when no slides are supplied", () => {
    expect(renderToStaticMarkup(<Presentation>{null}</Presentation>)).toBe("");
  });
});
