import type { Metadata } from "next";
import { readContentPageSource } from "@/lib/content-page-data";
import { renderMdx } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "What I’m Building Toward",
  description:
    "The long arc of Ben Everman’s work in AI, computational biology, and biological discovery.",
  alternates: { canonical: "/direction" },
  openGraph: {
    title: "What I’m Building Toward | Ben Everman",
    description:
      "The long arc of Ben Everman’s work in AI, computational biology, and biological discovery.",
    url: "/direction"
  }
};

export default async function DirectionPage() {
  const content = await renderMdx(await readContentPageSource("direction"));

  return (
    <main className="reading-column">
      <article>
        <div className="prose">{content}</div>
      </article>
    </main>
  );
}
