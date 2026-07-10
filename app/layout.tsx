import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./theme-provider";
import { PaperDebug } from "@/components/debug/paper-debug";
import "./globals.css";
// App.css is global (as it was via <link> in v7) so the home AND the lab's
// text layer share one source of truth for .intro typography — they must match.
import "@/site/App.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
          <PaperDebug />
        </ThemeProvider>
      </body>
    </html>
  );
}
