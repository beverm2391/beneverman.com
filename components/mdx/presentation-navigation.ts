export type PresentationAction =
  | "previous"
  | "next"
  | "down"
  | "up"
  | "surface"
  | "first"
  | "last"
  | { dive: number };

export type PresentationPosition = {
  /** Index along the spine. */
  column: number;
  /** 0 is the spine slide; 1..n are that concept's dives. */
  depth: number;
};

// Keep movement rules independent from the React surface: the live component
// and its tests share the same clamping behaviour at the deck edges.
export function getPresentationAction(key: string): PresentationAction | null {
  switch (key) {
    case "ArrowLeft":
    case "PageUp":
      return "previous";
    case "ArrowRight":
    case "PageDown":
      return "next";
    case "ArrowDown":
      return "down";
    case "ArrowUp":
      return "up";
    case "Home":
      return "first";
    case "End":
      return "last";
    case "0":
      // The panic key: surface to the top of the current concept.
      return "surface";
    default:
      if (/^[1-9]$/.test(key)) {
        return { dive: Number(key) };
      }
      return null;
  }
}

/**
 * The deck is a spine of concepts, each with an optional vertical stack of
 * dives. Left/right walk the spine and resume each column at its remembered
 * depth, so a dive left open is still open when the presenter returns.
 * Down/up move within the stack; digits jump straight to a dive; 0 surfaces.
 */
export function movePresentation(
  position: PresentationPosition,
  stackSizes: readonly number[],
  rememberedDepths: readonly number[],
  action: PresentationAction
): PresentationPosition {
  const columnCount = stackSizes.length;
  if (columnCount === 0) return { column: 0, depth: 0 };

  const clampDepth = (column: number, depth: number) =>
    Math.max(0, Math.min(depth, (stackSizes[column] ?? 1) - 1));
  const resume = (column: number) => ({
    column,
    depth: clampDepth(column, rememberedDepths[column] ?? 0)
  });

  if (typeof action === "object") {
    return {
      column: position.column,
      depth: clampDepth(position.column, action.dive)
    };
  }

  switch (action) {
    case "previous":
      return resume(Math.max(0, position.column - 1));
    case "next":
      return resume(Math.min(columnCount - 1, position.column + 1));
    case "first":
      return resume(0);
    case "last":
      return resume(columnCount - 1);
    case "down":
      return {
        column: position.column,
        depth: clampDepth(position.column, position.depth + 1)
      };
    case "up":
      return { column: position.column, depth: Math.max(0, position.depth - 1) };
    case "surface":
      return { column: position.column, depth: 0 };
  }
}

/** 0 → "", 1 → "a", 2 → "b" … the counter's depth letter. */
export function depthLetter(depth: number): string {
  return depth > 0 ? String.fromCharCode(96 + depth) : "";
}
