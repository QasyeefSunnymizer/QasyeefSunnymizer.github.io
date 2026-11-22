import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["SOFT", "WONK", "opsz"] });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", weight: "600" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Qasyeef (Sunny)",
  description:
    "Software engineer in KL. I build agentic systems and document-AI that has to survive real users. Dark fantasy addict.",
};

export const viewport: Viewport = {
  themeColor: "#0e0c14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
