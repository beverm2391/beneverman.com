import Link from "next/link";
import { formatPostDate, getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Technical notes from Ben Everman."
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <div className="post-list-head">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </div>
            <p>{post.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
