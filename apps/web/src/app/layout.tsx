import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { BRAND_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Offline Background Remover for App and CLI",
    template: "%s | Local Background Remover",
  },
  description:
    "Offline background remover for private, on-device workflows. Use the app or CLI, download publicly, and activate when ready.",
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
    title: "Offline Background Remover for App and CLI",
    description:
      "Private local background removal with desktop and terminal workflows. Public downloads, license-gated runtime, offline after activation.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Offline background remover for private, on-device workflows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offline Background Remover for App and CLI",
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
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav-wrap">
            <Link href="/" className="brand">
              Local Background Remover
            </Link>
            <nav className="nav-links">
              <Link href="/pricing">Pricing</Link>
              <Link href="/downloads">Downloads</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
