import { Geist_Mono, Lora } from "next/font/google";
import "./research.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-research",
  display: "swap"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-research-mono",
  display: "swap"
});

export default function ResearchLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`research-route ${lora.variable} ${geistMono.variable}`}>
      {children}
    </div>
  );
}
