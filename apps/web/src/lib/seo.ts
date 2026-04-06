import type { Metadata } from "next";

export const SITE_URL = "https://local.backgroundrm.com";
export const BRAND_NAME = "Local Background Remover";

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  noindex = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: BRAND_NAME,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Local Background Remover for private background cleanup on Mac",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}

export function serializeJsonLd(payload: Record<string, unknown>): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
