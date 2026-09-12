import { describe, expect, it } from "vitest";
import {
  depthLetter,
  getPresentationAction,
  movePresentation
} from "@/components/mdx/presentation-navigation";

// A five-concept spine: concepts 1 and 3 carry dives (stack size includes
// the spine slide itself).
const stacks = [1, 3, 1, 4, 1] as const;

describe("presentation navigation", () => {
  it("maps the supported keys to movement", () => {
    expect(getPresentationAction("ArrowLeft")).toBe("previous");
    expect(getPresentationAction("PageDown")).toBe("next");
    expect(getPresentationAction("ArrowDown")).toBe("down");
    expect(getPresentationAction("ArrowUp")).toBe("up");
    expect(getPresentationAction("Home")).toBe("first");
    expect(getPresentationAction("End")).toBe("last");
    expect(getPresentationAction("0")).toBe("surface");
    expect(getPresentationAction("3")).toEqual({ dive: 3 });
    expect(getPresentationAction("Escape")).toBeNull();
    expect(getPresentationAction("x")).toBeNull();
  });

  it("walks the spine without passing either edge", () => {
    expect(movePresentation({ column: 0, depth: 0 }, stacks, [], "previous")).toEqual({ column: 0, depth: 0 });
    expect(movePresentation({ column: 0, depth: 0 }, stacks, [], "next")).toEqual({ column: 1, depth: 0 });
    expect(movePresentation({ column: 4, depth: 0 }, stacks, [], "next")).toEqual({ column: 4, depth: 0 });
    expect(movePresentation({ column: 2, depth: 0 }, stacks, [], "first")).toEqual({ column: 0, depth: 0 });
    expect(movePresentation({ column: 0, depth: 0 }, stacks, [], "last")).toEqual({ column: 4, depth: 0 });
  });

  it("dives and climbs within a stack, clamped at both ends", () => {
    expect(movePresentation({ column: 1, depth: 0 }, stacks, [], "down")).toEqual({ column: 1, depth: 1 });
    expect(movePresentation({ column: 1, depth: 2 }, stacks, [], "down")).toEqual({ column: 1, depth: 2 });
    expect(movePresentation({ column: 1, depth: 2 }, stacks, [], "up")).toEqual({ column: 1, depth: 1 });
    expect(movePresentation({ column: 0, depth: 0 }, stacks, [], "down")).toEqual({ column: 0, depth: 0 });
  });

  it("jumps straight to a dive by digit and surfaces with 0", () => {
    expect(movePresentation({ column: 3, depth: 0 }, stacks, [], { dive: 2 })).toEqual({ column: 3, depth: 2 });
    expect(movePresentation({ column: 3, depth: 0 }, stacks, [], { dive: 9 })).toEqual({ column: 3, depth: 3 });
    expect(movePresentation({ column: 3, depth: 3 }, stacks, [], "surface")).toEqual({ column: 3, depth: 0 });
  });

  it("resumes each column at its remembered depth", () => {
    const remembered = [0, 2, 0, 3, 0];
    expect(movePresentation({ column: 0, depth: 0 }, stacks, remembered, "next")).toEqual({ column: 1, depth: 2 });
    expect(movePresentation({ column: 2, depth: 0 }, stacks, remembered, "next")).toEqual({ column: 3, depth: 3 });
    // An untouched column starts at its spine slide.
    expect(movePresentation({ column: 1, depth: 2 }, stacks, remembered, "next")).toEqual({ column: 2, depth: 0 });
    // Memory beyond a shrunken stack clamps rather than pointing off the end.
    expect(movePresentation({ column: 0, depth: 0 }, stacks, [0, 9], "next")).toEqual({ column: 1, depth: 2 });
  });

  it("keeps an empty deck at its origin", () => {
    expect(movePresentation({ column: 0, depth: 0 }, [], [], "next")).toEqual({ column: 0, depth: 0 });
  });

  it("letters the depths for the counter", () => {
    expect(depthLetter(0)).toBe("");
    expect(depthLetter(1)).toBe("a");
    expect(depthLetter(3)).toBe("c");
  });
});
