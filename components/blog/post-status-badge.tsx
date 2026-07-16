import { Badge } from "@/components/ui/badge";
import { includeDrafts, type BlogPostFrontmatter } from "@/lib/blog-data";

// Dev/preview-only status marker, rendered with the Coss Badge (globals.css
// carries the Coss token fallbacks on blog routes). Gated on the same flag
// that decides whether non-published posts render at all, so production
// builds (where every visible post is published anyway) never emit it, and a
// preview always shows which posts on the page aren't live yet: amber for
// unfinished work, muted for withdrawn work.
const badgeConfig = {
  draft: { label: "Draft", variant: "warning" },
  archived: { label: "Archived", variant: "secondary" }
} as const;

export function PostStatusBadge({
  status
}: {
  status: BlogPostFrontmatter["status"];
}) {
  if (!includeDrafts || status === "published") return null;
  const { label, variant } = badgeConfig[status];
  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}
