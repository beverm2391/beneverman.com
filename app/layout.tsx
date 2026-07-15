import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./theme-provider";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SITE_X_HANDLE } from "@/lib/site";

// Inter is the fallback family in the Geist stack; JetBrains Mono is the
// code/label font. Non-colliding var names so Tailwind's --font-sans/mono theme
// tokens (globals.css) own those.
//
// Both stay declared here because --font-mono resolves var(--font-jetbrains),
// so moving the variable off :root silently unstyles every mono element. Only
// the preload is scoped: next/font preloads on every route wrapped by the
// layout that declares it, which put 40KB of the code font on the homepage
// critical path, where nothing paints a glyph of it. preload:false leaves it to
// load from the stylesheet on the routes that actually reference it.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml"
    }
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: SITE_X_HANDLE,
    creator: SITE_X_HANDLE
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      {/* Geist is declared by hand in globals.css rather than via next/font
          (compiled diagram SVGs name the family literally, so it cannot become a
          hash), so the browser only discovers it once the stylesheet parses.
          That is too late for font-display: optional to ever choose it. */}
      <link
        rel="preload"
        href="/fonts/geist-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
