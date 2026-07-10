import { getBlogPosts } from "@/lib/blog-data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = await getBlogPosts();
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `<item>
  <title>${xml(post.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
  <description>${xml(post.description)}</description>
</item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${xml(SITE_NAME)}</title>
  <link>${SITE_URL}/blog</link>
  <description>${xml(SITE_DESCRIPTION)}</description>
  <language>en-us</language>
${items}
</channel>
</rss>`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
}
