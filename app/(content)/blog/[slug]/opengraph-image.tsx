import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og-card";
import { getBlogPostSummary } from "@/lib/blog-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlogOpenGraphImage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostSummary(slug);

  return new ImageResponse(
    <OgCard eyebrow="Ben Everman · Blog" title={post.title} description={post.description} />,
    size
  );
}
