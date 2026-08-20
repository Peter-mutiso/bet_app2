import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MarketListener from "@/components/market/MarketListener";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Quant Trader — Automated Trading Terminal",
    template: "%s · Quant Trader",
  },
  description:
    "Trade synthetic indices with real-time market data, automated analysis, and a professional trading terminal.",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning>
        <MarketListener />

        {children}
      </body>
    </html>
  );
}