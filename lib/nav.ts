export type NavItem = {
  label: string;
  href: string;
};

// Site navigation, shared by the homepage and the blog via SiteHeader.
// Keep it minimal.
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" }
];
