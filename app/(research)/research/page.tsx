import Link from "next/link";
import { PostStatusBadge } from "@/components/blog/post-status-badge";
import { ResearchNav } from "@/components/research-nav";
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
      <ResearchNav />
      <main className="research-frame">
        <section className="research-paper research-index">
          <header className="research-index-header">
            <p className="research-kicker">Research</p>
            <h1>Working models and experiments</h1>
            <p>
              Ideas under construction, written close to the experiments that
              might prove or break them.
            </p>
          </header>

          {publications.length === 0 ? (
            <p className="research-empty">No research publications yet.</p>
          ) : (
            <ul className="research-list">
              {publications.map((publication) => (
                <li key={publication.slug}>
                  <Link href={`/research/${publication.slug}`}>
                    <div className="research-list-heading">
                      <h2>{publication.title}</h2>
                      <PostStatusBadge status={publication.status} />
                    </div>
                    <time dateTime={publication.date}>
                      {formatResearchDate(publication.date)}
                    </time>
                    <p>{publication.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
