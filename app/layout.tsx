import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./theme-provider";
import "./globals.css";
// App.css is global (as it was via <link> in v7) so the home AND the lab's
// text layer share one source of truth for .intro typography — they must match.
import "@/scene/App.css";

// Inter is loaded as the fallback family in the Geist stack; JetBrains Mono is
// the code/label font. Non-colliding var names so Tailwind's --font-sans/mono
// theme tokens (globals.css) own those.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Ben Everman",
    template: "%s | Ben Everman"
  },
  description: "Ben Everman's personal site and technical blog."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
