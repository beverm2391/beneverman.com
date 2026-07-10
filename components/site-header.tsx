import Link from "next/link";
import { navItems } from "@/lib/nav";

// Shared home/blog nav. Two variants because the surfaces disagree on layout
// and color:
// - "paper" (blog): sticky in flow, theme-var colors.
// - "scene" (homepage): fixed so it adds no flow height to the 100svh scene
//   shell, and hard-coded scene ink (#171717) since the scene ignores the
//   light/dark theme.
// The lab is deliberately excluded — it has its own top bar.
export function SiteHeader({
  variant = "paper"
}: {
  variant?: "paper" | "scene";
}) {
  const onScene = variant === "scene";
  return (
    <header
      className={
        onScene
          ? "fixed top-0 left-0 z-10"
          : "sticky top-0 z-10 bg-transparent"
      }
    >
      <nav className="flex gap-6 px-7 py-[1.1rem]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              onScene
                ? "text-[0.95rem] text-[#171717] no-underline hover:opacity-60"
                : "text-[0.95rem] text-fg no-underline hover:text-accent"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
