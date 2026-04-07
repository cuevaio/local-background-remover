import type { Metadata } from "next";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExpLink from "@/components/experiments/ExpLink";
import StickyCta from "@/components/marketing/StickyCta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPARE_PAGES } from "@/content/compare-pages";
import {
  evaluateCompareAssignments,
  toFlagValues,
} from "@/lib/experiments/flags";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Background Remover Alternatives",
  description:
    "Compare Local Background Remover with remove.bg alternatives and other tools for private, local background removal on your Mac.",
  path: "/compare",
});

const COMPARE_PRIMARY_CTA: Record<string, { primaryHref: string; primaryLabel: string; secondaryHref: string; secondaryLabel: string }> = {
  control: {
    primaryHref: "/pricing",
    primaryLabel: "View one-time pricing",
    secondaryHref: "/downloads",
    secondaryLabel: "Install anytime",
  },
  pricing_first: {
    primaryHref: "/pricing",
    primaryLabel: "Compare plans",
    secondaryHref: "/gallery",
    secondaryLabel: "See examples",
  },
};

export default async function CompareIndexPage() {
  const assignments = await evaluateCompareAssignments();
  const cta = COMPARE_PRIMARY_CTA[assignments.comparePrimaryCta];
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
      <FlagValues values={toFlagValues(assignments)} />

      <main className="site-frame">
        <section className="section-block flex flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            Compare tools
          </Badge>
          <h1 className="display-title md:text-5xl">Compare private, local alternatives to upload-first tools</h1>
          <p className="section-copy md:text-lg">
            See when Local Background Remover makes more sense than browser-based tools, especially if you want private processing, one-time pricing, and a Mac app.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <ExpLink href={cta.primaryHref}>{cta.primaryLabel}</ExpLink>
            </Button>
            <Button asChild variant="outline">
              <ExpLink href={cta.secondaryHref}>{cta.secondaryLabel}</ExpLink>
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
                  <ExpLink href={`/compare/${page.slug}`}>{`Open ${page.competitorName} comparison`}</ExpLink>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <StickyCta
        title="Want a simpler local option?"
        description="Start with pricing, then install when you are ready."
        primaryLabel={cta.primaryLabel}
        primaryHref={cta.primaryHref}
        secondaryLabel={cta.secondaryLabel}
        secondaryHref={cta.secondaryHref}
      />
    </>
  );
}
