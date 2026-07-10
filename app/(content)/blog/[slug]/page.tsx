import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPostDate, getBlogPost, getBlogPosts } from "@/lib/blog";

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
      description: post.description
    };
  } catch {
    return {};
  }
}

async function getPostOrNotFound(slug: string) {
  try {
    return await getBlogPost(slug);
  } catch {
    notFound();
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostOrNotFound(slug);

  return (
    <main>
      <article>
        <header>
          <h1>{post.title}</h1>
          <p>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </p>
        </header>
        {post.content}
      </article>
    </main>
  );
}
