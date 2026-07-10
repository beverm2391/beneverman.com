import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Technical notes from Ben Everman."
};

// Frontmatter dates are date-only ("2026-07-09"); format in UTC so the
// rendered day never shifts with the build machine's timezone.
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main>
      <h1>Blog</h1>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <div className="post-list-head">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
            </div>
            <p>{post.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
