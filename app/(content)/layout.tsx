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
      <header className="site-header">
        <nav className="site-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
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
