import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { VercelToolbar } from "@vercel/toolbar/next";

import TrackedExpLink from "@/components/analytics/TrackedExpLink";
import { GOOGLE_ADS_ID } from "@/lib/analytics/google-ads";
import ExpLink from "@/components/experiments/ExpLink";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_NAME, SITE_URL, serializeJsonLd } from "@/lib/seo";
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
      default: "Local Background Remover for Mac",
      template: "%s | Local Background Remover",
    },
    description:
      "Remove backgrounds privately on your Mac with one-time pricing. Use the app for everyday work or the CLI for scripts and coding agents.",
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
      title: "Local Background Remover for Mac",
      description:
        "Private background removal on your Mac with one-time pricing. Desktop app for most buyers, optional CLI for scripts and coding agents.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Local background remover for Mac with private on-device processing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Background Remover for Mac",
    description:
      "Private background removal on your Mac with one-time pricing. App first, CLI available for scripts and coding agents.",
    images: ["/twitter-image"],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
    description:
      "Private background removal on your Mac with one-time pricing and an optional CLI for scripts and coding agents.",
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "cueva.io",
    url: SITE_URL,
    brand: BRAND_NAME,
    founder: {
      "@type": "Person",
      name: "Anthony Cueva",
    },
    sameAs: [
      "https://x.com/cuevaio",
      "https://linkedin.com/in/cuevaio",
      "https://instagram.com/cueva.io",
    ],
  };

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, geistMono.variable, display.variable)}
    >
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <Script id="website-jsonld" type="application/ld+json">
          {serializeJsonLd(websiteJsonLd)}
        </Script>
        <Script id="organization-jsonld" type="application/ld+json">
          {serializeJsonLd(organizationJsonLd)}
        </Script>
        <header className="sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-md supports-[backdrop-filter]:bg-background/74">
          <div className="site-frame flex min-h-16 items-center justify-between gap-4 px-5 md:px-10">
            <ExpLink href="/" className="inline-flex items-center">
              <BrandLogo />
            </ExpLink>
            <nav className="flex items-center gap-2 md:gap-3">
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <ExpLink href="/docs">CLI Docs</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <ExpLink href="/compare">Compare</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <ExpLink href="/blog">Blog</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                <ExpLink href="/gallery">Gallery</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <ExpLink href="/pricing">Pricing</ExpLink>
              </Button>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <ExpLink href="/downloads">Install</ExpLink>
              </Button>
              <Button asChild size="sm" variant="outline" className="sm:hidden">
                <ExpLink href="/pricing">Plans</ExpLink>
              </Button>
              <Button asChild size="sm" className="inline-flex">
                <TrackedExpLink href="/pricing" slot="header.buy_once" label="Buy once">
                  Buy once
                </TrackedExpLink>
              </Button>
            </nav>
          </div>
        </header>
        {children}
        <Analytics />
        {shouldInjectToolbar ? <VercelToolbar /> : null}
      </body>
    </html>
  );
}
