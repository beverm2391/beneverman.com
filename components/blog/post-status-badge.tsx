import { includeDrafts, type BlogPostFrontmatter } from "@/lib/blog-data";

// Dev/preview-only status marker. Gated on the same flag that decides whether
// non-published posts render at all, so production builds (where every
// visible post is published anyway) never emit it, and a preview always shows
// which posts on the page aren't live yet: amber for unfinished work,
// grey for withdrawn work.
const badgeStyles: Partial<Record<BlogPostFrontmatter["status"], string>> = {
  draft: "border-warning text-warning-foreground",
  archived: "border-border text-muted"
};

export function PostStatusBadge({
  status
}: {
  status: BlogPostFrontmatter["status"];
}) {
  const style = badgeStyles[status];
  if (!includeDrafts || !style) return null;
  return (
    <span
      className={`rounded-[4px] border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] ${style}`}
    >
      {status}
    </span>
  );
}
