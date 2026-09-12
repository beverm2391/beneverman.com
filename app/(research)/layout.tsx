import "katex/dist/katex.min.css";
import "../(content)/content.css";

// Research shares the long-form MDX primitives, but not the normal content
// chrome. Its nested layout owns the BENCORP paper shell and breadcrumb nav.
export default function ResearchRouteGroupLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
