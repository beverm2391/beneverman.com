import "./content.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteHeader } from "@/components/site-header";

// Layout for long-form content pages. The nav is shared with the homepage via
// SiteHeader; the theme toggle stays content-scoped in flow (the homepage
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
