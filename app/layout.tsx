import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AppProviders } from "@/components/providers/app-providers";
import { pl } from "@/lib/i18n";

import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-mono",
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
