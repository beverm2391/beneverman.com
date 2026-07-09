import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Technical notes from Ben Everman."
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main>
      <h1>Blog</h1>
      <ol>
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
              <p>
                <time dateTime={post.date}>{post.date}</time>
              </p>
            </article>
          </li>
        ))}
      </ol>
    </main>
  );
}
