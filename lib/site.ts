// www, not the apex, because the site has answered on www for years and the
// post slugs are unchanged: every existing link and indexed URL keeps resolving
// directly across the cutover instead of becoming a redirect. Whatever this
// says has to match the domain that actually serves the site, or every canonical
// we publish points at a redirect.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.beneverman.com"
).replace(/\/$/, "");

export const SITE_NAME = "Ben Everman";
export const SITE_DESCRIPTION = "Ben Everman's personal site and technical blog.";

// Attribution on a shared card (twitter:creator). Without it a post gets shared
// with nobody's name on it.
export const SITE_X_HANDLE = "@beneverman";
