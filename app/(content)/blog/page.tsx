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
      <ul className="m-0 grid list-none gap-9 p-0">
        {posts.map((post) => (
          <li key={post.slug}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
              <Link
                href={`/blog/${post.slug}`}
                className="text-[1.15rem] font-semibold tracking-[-0.01em] text-fg no-underline hover:text-accent"
              >
                {post.title}
              </Link>
              <time dateTime={post.date} className="whitespace-nowrap font-mono text-[0.8rem]">
                {formatPostDate(post.date)}
              </time>
            </div>
            <p className="mt-[0.35rem] text-muted">{post.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
