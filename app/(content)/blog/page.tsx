import Link from "next/link";
import { formatPostDate, getBlogPosts, includeDrafts } from "@/lib/blog-data";
import { PostStatusBadge } from "@/components/blog/post-status-badge";

export const metadata = {
  title: "Blog",
  description: "Technical notes from Ben Everman.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Ben Everman",
    description: "Technical notes from Ben Everman.",
    url: "/blog"
  }
};

export default async function BlogIndexPage() {
  // Where drafts render (dev/preview), archived posts join the list too, so
  // the index shows the full status picture; production readers never see
  // either.
  const posts = await getBlogPosts({ archived: includeDrafts });

  return (
    <main className="reading-column">
      <ul className="m-0 grid list-none gap-9 p-0">
        {posts.map((post) => (
          <li key={post.slug}>
            {/* The whole entry — title, date, description — is one link. */}
            <Link href={`/blog/${post.slug}`} className="group block no-underline">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                <span className="inline-flex items-baseline gap-2.5 text-[1.15rem] font-semibold tracking-[-0.01em] text-fg group-hover:text-accent">
                  {post.title}
                  <PostStatusBadge status={post.status} />
                </span>
                <time dateTime={post.date} className="whitespace-nowrap font-mono text-[0.8rem]">
                  {formatPostDate(post.date)}
                </time>
              </div>
              <p className="mt-[0.35rem] text-muted">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
