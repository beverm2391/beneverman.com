import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PostStatusBadge } from "@/components/blog/post-status-badge";
import { PostToc } from "@/components/blog/post-toc";
import { ResearchNav } from "@/components/research-nav";
import {
  formatResearchDate,
  getResearchPublication,
  getResearchPublications,
  getResearchSummary
} from "@/lib/research";
import { includeDrafts } from "@/lib/research-data";
import { SITE_NAME, SITE_URL, SITE_X_HANDLE } from "@/lib/site";

type ResearchPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const publications = await getResearchPublications({ archived: includeDrafts });
  return publications.map((publication) => ({ slug: publication.slug }));
}

export async function generateMetadata({
  params
}: ResearchPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const publication = await getResearchSummary(slug);
    return {
      title: publication.title,
      description: publication.description,
      authors: [{ name: SITE_NAME, url: SITE_URL }],
      alternates: { canonical: `/research/${publication.slug}` },
      openGraph: {
        type: "article",
        title: publication.title,
        description: publication.description,
        url: `/research/${publication.slug}`,
        publishedTime: `${publication.date}T00:00:00Z`,
        ...(publication.updated
          ? { modifiedTime: `${publication.updated}T00:00:00Z` }
          : {}),
        authors: [SITE_NAME],
        tags: publication.tags
      },
      twitter: {
        card: "summary_large_image",
        title: publication.title,
        description: publication.description,
        site: SITE_X_HANDLE,
        creator: SITE_X_HANDLE
      }
    };
  } catch {
    return {};
  }
}

async function getPublicationOrNotFound(slug: string) {
  try {
    return await getResearchPublication(slug);
  } catch (error) {
    console.error(`getResearchPublication("${slug}") failed:`, error);
    notFound();
  }
}

async function getSummaryOrNotFound(slug: string) {
  try {
    return await getResearchSummary(slug);
  } catch (error) {
    console.error(`getResearchSummary("${slug}") failed:`, error);
    notFound();
  }
}

export default async function ResearchPage({ params }: ResearchPageProps) {
  const { slug } = await params;
  const { status } = await getSummaryOrNotFound(slug);
  if (status === "archived" && !includeDrafts) redirect("/research");

  const publication = await getPublicationOrNotFound(slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: publication.title,
    description: publication.description,
    url: `${SITE_URL}/research/${publication.slug}`,
    datePublished: `${publication.date}T00:00:00Z`,
    dateModified: `${publication.updated ?? publication.date}T00:00:00Z`,
    keywords: publication.tags,
    author: { "@type": "Person", name: SITE_NAME, url: SITE_URL }
  };

  return (
    <div className="research-route">
      <ResearchNav title={publication.title} />
      <main className="research-frame">
        <div className="research-paper">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />
          <article className="research-article">
            <header className="research-article-header">
              <p className="research-date">
                <time dateTime={publication.date}>
                  {formatResearchDate(publication.date)}
                </time>
                <PostStatusBadge status={publication.status} />
              </p>
              <h1>{publication.title}</h1>
              <p className="research-description">{publication.description}</p>
            </header>

            <PostToc
              items={publication.toc}
              className="research-toc"
              activationOffset={150}
              activateFirst
            />

            <div className="research-prose-container">
              <div className="prose research-prose">{publication.content}</div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
