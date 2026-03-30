import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import StickyCta from "@/components/marketing/StickyCta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPARE_PAGES } from "@/content/compare-pages";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Background Removal Alternatives and Compare Pages",
  description:
    "Browse side-by-side compare pages for remove.bg alternatives and other background removal tools.",
  path: "/compare",
});

export default function CompareIndexPage() {
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
        name: "Compare",
        item: "https://local.backgroundrm.com/compare",
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: COMPARE_PAGES.map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://local.backgroundrm.com/compare/${page.slug}`,
      name: `Local vs ${page.competitorName}`,
    })),
  };

  return (
    <>
      <Script id="compare-index-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <Script id="compare-index-itemlist-jsonld" type="application/ld+json">
        {serializeJsonLd(itemListJsonLd)}
      </Script>

      <main className="site-frame">
        <section className="section-block flex flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            Compare pages
          </Badge>
          <h1 className="display-title md:text-5xl">Find the right background removal alternative.</h1>
          <p className="section-copy md:text-lg">
            Explore side-by-side comparisons between Local Background Remover and the most searched
            background removal tools.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/downloads">Download Local</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">View one-time pricing</Link>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider grid gap-4 sm:grid-cols-2">
          {COMPARE_PAGES.map((page) => (
            <Card key={page.slug} className="bg-card/95">
              <CardHeader>
                <CardTitle>{`Local vs ${page.competitorName}`}</CardTitle>
                <CardDescription>{page.heroDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Reviewed from public product pages on {page.lastReviewedAt}.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/compare/${page.slug}`}>{`Open ${page.competitorName} comparison`}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <StickyCta
        title="Need private background removal?"
        description="Choose local app + CLI workflows with one-time pricing."
        primaryLabel="Open downloads"
        primaryHref="/downloads"
        secondaryLabel="See pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}
