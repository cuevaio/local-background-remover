import type { MetadataRoute } from "next";

import { COMPARE_SLUGS } from "@/content/compare-pages";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const compareEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/compare`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...COMPARE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/compare/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
  ];

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/downloads`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.74,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/customers`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.62,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.63,
    },
    ...compareEntries,
  ];
}
