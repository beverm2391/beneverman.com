import { Lora } from "next/font/google";
import "./research.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-research",
  display: "swap"
});

export default function ResearchLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`research-route ${lora.variable}`}>{children}</div>;
}
