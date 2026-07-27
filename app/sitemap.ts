import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog-data";
import { getResearchPublications } from "@/lib/research-data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  const research = await getResearchPublications();

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/direction`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/research`, changeFrequency: "monthly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.7
    })),
    ...research.map((publication) => ({
      url: `${SITE_URL}/research/${publication.slug}`,
      lastModified: new Date(`${publication.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.8
    }))
  ];
}
