export type NavItem = {
  label: string;
  href: string;
};

// Content-page navigation. The homepage is chrome-less (the art) and does not
// use this. Keep it minimal.
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" }
];
