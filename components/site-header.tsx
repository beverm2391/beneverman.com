import Link from "next/link";
import { navItems } from "@/lib/nav";

// Shared site nav. Both variants use theme-var colors; they differ only in
// layout:
// - "paper" (content routes): sticky in flow. It is transparent by default;
//   `surface="page"` uses the normal page color when a nested route owns a
//   different ground. Ben rejected a translucent or blurred bar.
// - "overlay" (homepage): fixed, so it adds no flow height to the vertically
//   centered 100svh page.
// The lab is deliberately excluded — it has its own top bar.
export function SiteHeader({
  variant = "paper",
  surface = "transparent"
}: {
  variant?: "paper" | "overlay";
  surface?: "transparent" | "page";
}) {
  return (
    <header
      className={
        variant === "overlay"
          ? "fixed top-0 left-0 z-10"
          : `sticky top-0 z-10 ${surface === "page" ? "bg-bg" : "bg-transparent"}`
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
