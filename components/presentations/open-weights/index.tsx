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
  // Hook and what
  "title",
  "what-i-mean",
  "fig-how-chatbots-work",
  "fig-the-file-locked-vs-free",
  "closed-vs-open-tech",
  // The receipts
  "when-closed-tech-goes-wrong",
  "receipt-uber",
  "receipt-instagram",
  "why-do-we-put-up",
  "dynamic-dependence",
  "dynamic-no-substitutes",
  "the-airbag",
  // When open tech goes right
  "when-open-tech-goes-right",
  "receipt-mp3",
  "fig-open-internet-vs-closed-ai",
  // Why open weights
  "why-open-weights",
  "benefit-refuse",
  "benefit-privacy",
  "benefit-price",
  "benefit-forever",
  "benefit-community",
  "benefit-custom",
  "benefit-on-device",
  "speed-demo",
  "model-landscape",
  // How
  "how-do-you-start",
  "how-everyone",
  "how-coders",
  "how-the-rabbit-hole",
  // Close
  "own-the-weights",
  "references",
  // The technical door: reached only on purpose.
  "appendix",
  "what-is-a-weight",
  "fig-what-is-a-weight",
  "fig-text-through-weights",
  "optimized-for-retention",
  "fig-retention-diverges",
  "fig-growing-dependence"
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
