import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

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
    "Private background removal for desktop and CLI workflows. Download publicly, activate matching keys, and keep processing offline after activation.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BRAND_NAME,
    title: "Local Background Remover for App and CLI",
    description:
      "Private local background removal with desktop and terminal workflows. Public downloads, license-gated runtime, offline after activation.",
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
      "Private local background removal with desktop and terminal workflows. Public downloads, license-gated runtime, offline after activation.",
    images: ["/twitter-image"],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, geistMono.variable, display.variable)}
    >
      <body>
        <header className="sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-md supports-[backdrop-filter]:bg-background/74">
          <div className="site-frame flex min-h-16 items-center justify-between gap-4 px-5 md:px-10">
            <Link href="/" className="font-display text-sm font-semibold tracking-tight md:text-base">
              local.backgroundrm
            </Link>
            <nav className="flex items-center gap-2 md:gap-3">
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <Link href="/compare">Compare</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/downloads">Downloads</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="sm:hidden">
                <Link href="/pricing">Plans</Link>
              </Button>
              <Button asChild size="sm" className="inline-flex">
                <Link href="/pricing">Buy once</Link>
              </Button>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
