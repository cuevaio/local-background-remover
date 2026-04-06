import type { Metadata } from "next";
import Script from "next/script";

import ExpLink from "@/components/experiments/ExpLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBlogPosts, getLatestBlogUpdate } from "@/content/blog";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Background Removal Blog",
  description:
    "Read guides on private background removal, Mac workflows, batch image cleanup, and local alternatives to upload-first tools.",
  path: "/blog",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();
  const latestUpdate = await getLatestBlogUpdate();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://local.backgroundrm.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://local.backgroundrm.com/blog",
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://local.backgroundrm.com/blog/${post.slug}`,
      name: post.title,
      description: post.description,
    })),
  };

  return (
    <>
      <Script id="blog-index-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <Script id="blog-index-itemlist-jsonld" type="application/ld+json">
        {serializeJsonLd(itemListJsonLd)}
      </Script>

      <main className="site-frame">
        <section className="section-block flex flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            Blog
          </Badge>
          <h1 className="display-title md:text-5xl">SEO guides for private background removal on Mac</h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Browse practical guides for Mac users, sellers, and small teams comparing local background removal, offline workflows, batch cleanup, and command-line automation.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{`${posts.length} posts`}</span>
            <span className="inline-block size-1 rounded-full bg-border" />
            <span>{`Updated ${DATE_FORMATTER.format(new Date(latestUpdate))}`}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <ExpLink href="/pricing">View one-time pricing</ExpLink>
            </Button>
            <Button asChild variant="outline">
              <ExpLink href="/compare">Compare alternatives</ExpLink>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider grid gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.slug} className="bg-card/95">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <span>{post.eyebrow}</span>
                  <span className="inline-block size-1 rounded-full bg-border" />
                  <span>{post.targetKeyword}</span>
                </div>
                <CardTitle className="text-2xl leading-tight">{post.title}</CardTitle>
                <CardDescription className="text-sm leading-6">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {post.heroHighlights.map((highlight) => (
                    <span key={highlight} className="rounded-full border border-border/80 bg-secondary/45 px-3 py-1">
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{`Updated ${DATE_FORMATTER.format(new Date(post.updatedAt))}`}</span>
                  <Button asChild variant="outline">
                    <ExpLink href={`/blog/${post.slug}`}>Read post</ExpLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
