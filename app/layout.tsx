import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Roboto, Roboto_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

const Analytics = dynamic(() =>
  import("@vercel/analytics/next").then((mod) => mod.Analytics),
);
const SpeedInsights = dynamic(() =>
  import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
);
import { pl } from "@/lib/i18n";

import "./globals.css";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: pl.app.name,
  description: pl.app.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: pl.app.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AppProviders>{children}</AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
