import { describe, expect, it } from "vitest";
import { getPresentationAction, movePresentationSlide } from "@/components/mdx/presentation-navigation";

describe("presentation navigation", () => {
  it("maps the supported keys to slide movement", () => {
    expect(getPresentationAction("ArrowLeft")).toBe("previous");
    expect(getPresentationAction("PageDown")).toBe("next");
    expect(getPresentationAction("Home")).toBe("first");
    expect(getPresentationAction("End")).toBe("last");
    expect(getPresentationAction("Escape")).toBeNull();
  });

  it("moves through the deck without passing either edge", () => {
    expect(movePresentationSlide(0, 3, "previous")).toBe(0);
    expect(movePresentationSlide(0, 3, "next")).toBe(1);
    expect(movePresentationSlide(2, 3, "next")).toBe(2);
    expect(movePresentationSlide(1, 3, "first")).toBe(0);
    expect(movePresentationSlide(1, 3, "last")).toBe(2);
  });

  it("keeps an empty deck at its only valid index", () => {
    expect(movePresentationSlide(0, 0, "next")).toBe(0);
  });
});
