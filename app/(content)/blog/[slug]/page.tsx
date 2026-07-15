import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { formatPostDate, getBlogPost, getBlogPostSummary, getBlogPosts } from "@/lib/blog";
import { PostToc } from "@/components/blog/post-toc";
import { SITE_NAME, SITE_URL, SITE_X_HANDLE } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Frontmatter is all this needs — compiling the body here would cost a full
    // MDX render (and a headless Chromium launch for mermaid posts) per route.
    const post = await getBlogPostSummary(slug);

    return {
      title: post.title,
      description: post.description,
      authors: [{ name: SITE_NAME, url: SITE_URL }],
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        type: "article",
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
        publishedTime: `${post.date}T00:00:00Z`,
        // Only when the post actually changed; a modifiedTime that just echoes
        // publishedTime tells a reader nothing.
        ...(post.updated ? { modifiedTime: `${post.updated}T00:00:00Z` } : {}),
        authors: [SITE_NAME],
        tags: post.tags
      },
      // Next replaces this object wholesale rather than merging it with the
      // root layout's, so the handles have to be repeated here or posts ship
      // without attribution.
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        site: SITE_X_HANDLE,
        creator: SITE_X_HANDLE
      }
    };
  } catch {
    return {};
  }
}

async function getPostOrNotFound(slug: string) {
  try {
    return await getBlogPost(slug);
  } catch (error) {
    // Bad slugs 404, but a post that fails to *compile* must be loud in the
    // server log — a silent 404 here once hid a broken MDX pipeline.
    console.error(`getBlogPost("${slug}") failed:`, error);
    notFound();
  }
}

async function getSummaryOrNotFound(slug: string) {
  try {
    return await getBlogPostSummary(slug);
  } catch (error) {
    console.error(`getBlogPostSummary("${slug}") failed:`, error);
    notFound();
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Withdrawn posts keep their URL working but send readers to the index —
  // frontmatter-driven, so no hardcoded redirects in next.config. This reads
  // frontmatter *before* compiling on purpose: archived posts are excluded from
  // generateStaticParams, so this path runs on demand in the serverless runtime,
  // where compiling a mermaid post would try to launch a headless Chromium that
  // isn't there — turning the redirect into a 404.
  const { status } = await getSummaryOrNotFound(slug);
  if (status === "archived") redirect("/blog");

  const post = await getPostOrNotFound(slug);

  // Structured data is the machine-readable twin of the metadata above: the
  // meta tags tell a social card what to draw, this tells a search engine what
  // the page *is*. Kept next to the article it describes so the two cannot
  // drift.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: `${post.date}T00:00:00Z`,
    dateModified: `${post.updated ?? post.date}T00:00:00Z`,
    keywords: post.tags,
    author: { "@type": "Person", name: SITE_NAME, url: SITE_URL }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from our own frontmatter, never from reader input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article>
        <header className="mb-8">
          <h1 className="mb-[0.35rem] text-[1.7rem] font-[650] leading-[1.2] tracking-[-0.02em]">
            {post.title}
          </h1>
          <p>
            <time dateTime={post.date} className="font-mono text-[0.8rem]">
              {formatPostDate(post.date)}
            </time>
          </p>
        </header>
        {/* Long-form only: a couple of headings don't need navigation. In
            flow here so the rail starts level with the article body — see
            the .post-toc rules for how it leaves the column. */}
        {post.toc.length >= 4 ? <PostToc items={post.toc} /> : null}
        <div className="prose">{post.content}</div>
      </article>
    </main>
  );
}
