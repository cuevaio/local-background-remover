import type { MetadataRoute } from "next";

import { getAllBlogPosts, getBlogSlugs, getLatestBlogUpdate } from "@/content/blog";
import { COMPARE_PAGES, COMPARE_SLUGS } from "@/content/compare-pages";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const latestBlogUpdate = await getLatestBlogUpdate();
  const blogPosts = await getAllBlogPosts();
  const blogSlugs = await getBlogSlugs();
  const blogPostBySlug = new Map(blogPosts.map((post) => [post.slug, post]));
  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.84,
      lastModified: new Date(latestBlogUpdate),
    },
    ...blogSlugs.map((slug) => {
      const blogPost = blogPostBySlug.get(slug);
      return {
        url: `${SITE_URL}/blog/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.76,
        lastModified: blogPost ? new Date(blogPost.updatedAt) : undefined,
      };
    }),
  ];
  const comparePageBySlug = new Map(COMPARE_PAGES.map((page) => [page.slug, page]));
  const compareEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/compare`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: new Date("2026-03-30"),
    },
    ...COMPARE_SLUGS.map((slug) => {
      const comparePage = comparePageBySlug.get(slug);
      return {
        url: `${SITE_URL}/compare/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.72,
        lastModified: comparePage ? new Date(comparePage.lastReviewedAt) : undefined,
      };
    }),
  ];

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: "weekly",
      priority: 0.9,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/downloads`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/docs`,
      changeFrequency: "weekly",
      priority: 0.82,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/gallery`,
      changeFrequency: "weekly",
      priority: 0.78,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: "weekly",
      priority: 0.74,
      lastModified: new Date("2026-04-06"),
    },
    ...blogEntries,
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/customers`,
      changeFrequency: "monthly",
      priority: 0.68,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.62,
      lastModified: new Date("2026-04-06"),
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.63,
      lastModified: new Date("2026-04-06"),
    },
    ...compareEntries,
  ];
}
