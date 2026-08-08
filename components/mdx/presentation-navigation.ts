export type PresentationAction = "previous" | "next" | "first" | "last";

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
    case "Home":
      return "first";
    case "End":
      return "last";
    default:
      return null;
  }
}

export function movePresentationSlide(
  currentIndex: number,
  slideCount: number,
  action: PresentationAction
): number {
  if (slideCount <= 0) return 0;

  switch (action) {
    case "previous":
      return Math.max(0, currentIndex - 1);
    case "next":
      return Math.min(slideCount - 1, currentIndex + 1);
    case "first":
      return 0;
    case "last":
      return slideCount - 1;
  }
}
