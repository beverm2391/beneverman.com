import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { cloneElement } from "react";
import { Presentation } from "@/components/mdx/presentation";
import { slides, type SlideName } from "./slides";

const openWeightsSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-presentation-serif",
  display: "swap"
});

const openWeightsMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-presentation-mono",
  display: "swap"
});

// The setlist: which slides from the bench make this deck, in talk order.
// Other cuts of the same material (a more technical version, a shorter one)
// are just other setlists over the same bench.
const setlist = [
  "title",
  "closed-vs-open-tech",
  "when-closed-tech-goes-wrong",
  "receipt-uber",
  "receipt-instagram",
  "why-do-we-put-up",
  "dynamic-dependence",
  "dynamic-no-substitutes",
  "receipt-bed",
  "the-airbag",
  "hook-ai-next",
  "hook-the-door",
  "model-landscape",
  "what-is-a-weight",
  "fig-what-is-a-weight",
  "fig-text-through-weights",
  "thesis",
  "closed-model-problems",
  "optimized-for-retention",
  "fig-retention-diverges",
  "fig-growing-dependence",
  "fig-open-internet-vs-closed-ai",
  "references"
] as const satisfies readonly SlideName[];

export function OpenWeightsPresentation() {
  return (
    <Presentation
      label="Open Weight Models"
      monoFontClassName={openWeightsMono.variable}
      serifFontClassName={openWeightsSerif.variable}
    >
      {setlist.map((name) => cloneElement(slides[name], { key: name }))}
    </Presentation>
  );
}
