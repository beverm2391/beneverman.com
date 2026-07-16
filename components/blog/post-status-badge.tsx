import { includeDrafts, type BlogPostFrontmatter } from "@/lib/blog-data";

// Dev/preview-only status marker. Gated on the same flag that decides whether
// drafts render at all, so production builds (where every visible post is
// published anyway) never emit it, and a preview always shows which posts on
// the page aren't live yet.
export function PostStatusBadge({
  status
}: {
  status: BlogPostFrontmatter["status"];
}) {
  if (!includeDrafts || status === "published") return null;
  return (
    <span className="rounded-[4px] border border-warning px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-warning-foreground">
      {status}
    </span>
  );
}
