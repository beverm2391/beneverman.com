import Link from "next/link";
import { navItems } from "@/lib/nav";

// Shared site nav. Both variants use theme-var colors; they differ only in
// layout:
// - "paper" (blog): sticky in flow. Deliberately transparent — Ben rejected a
//   translucent/blurred bar; content scrolling under the bare links is the
//   intended look.
// - "overlay" (homepage): fixed, so it adds no flow height to the vertically
//   centered 100svh page.
// The lab is deliberately excluded — it has its own top bar.
export function SiteHeader({
  variant = "paper"
}: {
  variant?: "paper" | "overlay";
}) {
  return (
    <header
      className={
        variant === "overlay"
          ? "fixed top-0 left-0 z-10"
          : "sticky top-0 z-10 bg-transparent"
      }
    >
      <nav className="flex gap-6 px-7 py-[1.1rem]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[0.95rem] text-fg no-underline hover:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
