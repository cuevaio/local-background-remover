import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { VercelToolbar } from "@vercel/toolbar/next";

import ExpLink from "@/components/experiments/ExpLink";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import SiteFooter from "@/components/marketing/SiteFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Local Background Remover for App and CLI",
    template: "%s | Local Background Remover",
  },
  description:
    "Private background removal for indie builders. Use the desktop app or command line tool with simple one-time pricing.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BRAND_NAME,
    title: "Local Background Remover for App and CLI",
    description:
      "Private local background removal for independent creators using desktop and terminal workflows with one-time pricing.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Local background remover for private, on-device workflows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Background Remover for App and CLI",
    description:
      "Private local background removal for independent creators using desktop and terminal workflows with one-time pricing.",
    images: ["/twitter-image"],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, geistMono.variable, display.variable)}
    >
      <body>
        <header className="sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-md supports-[backdrop-filter]:bg-background/74">
          <div className="site-frame flex min-h-16 items-center justify-between gap-4 px-5 md:px-10">
            <ExpLink href="/" className="inline-flex items-center">
              <BrandLogo />
            </ExpLink>
            <nav className="flex items-center gap-2 md:gap-3">
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <ExpLink href="/docs">Docs</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <ExpLink href="/compare">Compare</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <ExpLink href="/pricing">Pricing</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <ExpLink href="/downloads">Downloads</ExpLink>
              </Button>
              <Button asChild size="sm" variant="outline" className="sm:hidden">
                <ExpLink href="/pricing">Plans</ExpLink>
              </Button>
              <Button asChild size="sm" className="inline-flex">
                <ExpLink href="/pricing">Buy once</ExpLink>
              </Button>
            </nav>
          </div>
        </header>
        {children}
        <div className="site-frame">
          <SiteFooter />
        </div>
        <Analytics />
        {shouldInjectToolbar ? <VercelToolbar /> : null}
      </body>
    </html>
  );
}
