export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://beneverman.com").replace(/\/$/, "");

export const SITE_NAME = "Ben Everman";
export const SITE_DESCRIPTION = "Ben Everman's personal site and technical blog.";

// Attribution on a shared card (twitter:creator). Without it a post gets shared
// with nobody's name on it.
export const SITE_X_HANDLE = "@beneverman";
