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

// The setlist: the talk's spine, with each concept's optional dives stacked
// under it. Right/left walk the spine; down opens the current concept's
// deeper layer. Other cuts of the same material are just other setlists.
type SetlistEntry =
  | SlideName
  | { readonly slide: SlideName; readonly dives: readonly SlideName[] };

const setlist: readonly SetlistEntry[] = [
  "title",
  "how-this-talk-works",
  "altman-receipt",
  "companies-dont-say-what-they-mean",
  {
    slide: "translator-nuclear",
    dives: ["translator-ban", "translator-regulation", "translator-surveillance", "translator-fine-print"]
  },
  {
    slide: "fig-how-chatbots-work",
    dives: ["what-i-mean", "what-is-a-weight", "fig-what-is-a-weight", "fig-text-through-weights"]
  },
  "closed-vs-open-tech",
  "when-closed-tech-goes-wrong",
  { slide: "receipt-uber", dives: ["drill-uber-airport"] },
  "receipt-instagram",
  "receipt-hardware",
  { slide: "why-do-we-put-up", dives: ["fig-retention-diverges"] },
  { slide: "dynamic-dependence", dives: ["altman-meter", "fig-growing-dependence"] },
  "dynamic-no-substitutes",
  "when-open-tech-goes-right",
  { slide: "receipt-internet", dives: ["fig-open-internet-vs-closed-ai"] },
  "closed-internet",
  {
    slide: "why-open-weights",
    dives: ["invoke-regulated-info", "invoke-data-privacy", "invoke-perf-cost"]
  },
  "how-do-you-start",
  "how-hosted",
  "how-own-hardware",
  { slide: "how-find-models", dives: ["model-landscape"] },
  "how-cloud",
  "references"
];

export function OpenWeightsPresentation() {
  return (
    <Presentation
      label="Open Weight Models"
      monoFontClassName={openWeightsMono.variable}
      serifFontClassName={openWeightsSerif.variable}
      columns={setlist.map((entry) => {
        const names = typeof entry === "string" ? [entry] : [entry.slide, ...entry.dives];
        return names.map((name) => cloneElement(slides[name], { key: name }));
      })}
    />
  );
}
