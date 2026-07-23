export type NavItem = {
  label: string;
  href: string;
};

// Site navigation, shared by the homepage and content routes via SiteHeader.
// Keep it minimal.
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Direction", href: "/direction" },
  { label: "Blog", href: "/blog" }
];
