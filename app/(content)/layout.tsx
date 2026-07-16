import "./content.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteHeader } from "@/components/site-header";

// Layout for content pages (blog). The nav is shared with the homepage via
// SiteHeader; the theme toggle stays blog-scoped in flow (the homepage
// renders its own).
export default function ContentLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <ThemeToggle />
      {children}
    </>
  );
}
