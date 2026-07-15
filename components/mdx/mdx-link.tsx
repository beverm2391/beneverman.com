import Link from "next/link";

// MDX `a` renderer: internal links go through next/link; http(s) links to
// other sites open in a new tab with rel hardening; anything else (mailto,
// #fragments) stays a plain anchor. Styling stays with .prose.
export function MdxLink({
  href = "",
  children,
  ...props
}: React.ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
