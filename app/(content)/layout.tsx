import "./content.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { PaperBackground } from "@/components/paper-background";
import { PaperDebug } from "@/components/debug/paper-debug";
import { SiteHeader } from "@/components/site-header";

// Layout for content pages (blog). The nav is shared with the homepage via
// SiteHeader; the paper background, theme toggle, and grain debugger stay
// blog-scoped.
export default function ContentLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PaperBackground />
      <SiteHeader />
      <ThemeToggle />
      {children}
      <PaperDebug />
    </>
  );
}
