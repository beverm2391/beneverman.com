import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems } from "@/lib/nav";

// Layout for content pages (blog). The homepage lives outside this route group,
// so it stays chrome-less.
export default function ContentLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-transparent">
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
      <ThemeToggle />
      {children}
    </>
  );
}
