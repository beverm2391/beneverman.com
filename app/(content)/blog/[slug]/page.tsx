import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { formatPostDate, getBlogPost, getBlogPosts } from "@/lib/blog";
import { PostToc } from "@/components/blog/post-toc";

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
    const post = await getBlogPost(slug);

    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        type: "article",
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
        publishedTime: `${post.date}T00:00:00Z`,
        authors: ["Ben Everman"],
        tags: post.tags
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostOrNotFound(slug);

  // Withdrawn posts keep their URL working but send readers to the index —
  // frontmatter-driven, so no hardcoded redirects in next.config.
  if (post.archived) redirect("/blog");

  return (
    <main>
      <article>
        <header className="mb-[3.25rem]">
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
