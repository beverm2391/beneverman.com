import Link from "next/link";
import { PostStatusBadge } from "@/components/blog/post-status-badge";
import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  formatResearchDate,
  getResearchPublications,
  includeDrafts
} from "@/lib/research-data";

export const metadata = {
  title: "Research",
  description: "Working models, experiments, and scientific trajectories from Ben Everman.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research | Ben Everman",
    description: "Working models, experiments, and scientific trajectories from Ben Everman.",
    url: "/research"
  }
};

export default async function ResearchIndexPage() {
  const publications = await getResearchPublications({ archived: includeDrafts });

  return (
    <>
      <SiteHeader />
      <ThemeToggle />
      <main className="reading-column research-index">
        {publications.length === 0 ? (
          <p className="text-muted">No research publications yet.</p>
        ) : (
          <ul className="m-0 grid list-none gap-9 p-0">
            {publications.map((publication) => (
              <li key={publication.slug}>
                <Link
                  href={`/research/${publication.slug}`}
                  className="group block no-underline"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                    <span className="inline-flex items-baseline gap-2.5 text-[1.15rem] font-semibold tracking-[-0.01em] text-fg group-hover:text-accent">
                      {publication.title}
                      <PostStatusBadge status={publication.status} />
                    </span>
                    <time
                      dateTime={publication.date}
                      className="whitespace-nowrap font-[family-name:var(--font-research-mono)] text-[0.8rem]"
                    >
                      {formatResearchDate(publication.date)}
                    </time>
                  </div>
                  <p className="mt-[0.35rem] text-muted">
                    {publication.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
