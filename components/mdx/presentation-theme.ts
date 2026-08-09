import type { CSSProperties } from "react";

// A presentation owns its entire visual system through one theme object,
// deliberately decoupled from the site's light/dark tokens: decks are paper
// artifacts (like PDFs) that look identical in every viewing context, and
// generated raster figures share the theme's exact hexes so they sit on
// slides without a visible canvas seam.
export type PresentationTheme = {
  /** Slide surface, and the mandated canvas color for generated figures. */
  paper: string;
  /** Primary text ink for titles and body. */
  ink: string;
  /** Secondary ink: chrome, captions, de-emphasized text. */
  inkMuted: string;
  /** Hairline rules and borders. */
  rule: string;
  /** The working annotation ink: kickers, labels, figure strokes. */
  annotation: string;
  /** Pale fill companion to the annotation ink. */
  annotationTint: string;
  /**
   * Semantic accent reserved for the antagonist of a diagram or claim (the
   * gateway, the chokepoint, the dependency). Never decorative.
   */
  accent: string;
};

// Drafting-blueprint ink on cream paper. Blue does the explaining; orange
// appears only on the thing that controls you.
export const blueprintTheme: PresentationTheme = {
  paper: "#faf9f6",
  ink: "#262626",
  inkMuted: "#686868",
  rule: "rgb(0 0 0 / 0.08)",
  annotation: "#3c6af4",
  annotationTint: "#aabff8",
  accent: "#e8735a"
};

// Slide markup styles against these variables (e.g. `text-(--pres-ink)`), so
// swapping the theme object restyles a whole deck.
export function presentationThemeStyle(theme: PresentationTheme): CSSProperties {
  return {
    "--pres-paper": theme.paper,
    "--pres-ink": theme.ink,
    "--pres-ink-muted": theme.inkMuted,
    "--pres-rule": theme.rule,
    "--pres-annotation": theme.annotation,
    "--pres-annotation-tint": theme.annotationTint,
    "--pres-accent": theme.accent
  } as CSSProperties;
}
