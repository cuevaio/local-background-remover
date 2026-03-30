import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import PricingPolicyFaq from "@/components/marketing/PricingPolicyFaq";
import StickyCta from "@/components/marketing/StickyCta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

import PricingClient from "./PricingClient";

export const metadata: Metadata = buildPageMetadata({
  title: "One-Time Pricing for Local Background Remover",
  description:
    "Compare one-time plans for desktop, command-line, or both.",
  path: "/pricing",
});

export default function PricingPage() {
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
        name: "Pricing",
        item: "https://local.backgroundrm.com/pricing",
      },
    ],
  };

  return (
    <>
      <Script id="pricing-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>

      <main className="site-frame flex flex-col gap-0 pb-36">
        <section className="section-block flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-card">
            One-time plans
          </Badge>
          <h1 className="display-title md:text-5xl">
            Pick what you need now and add more later.
          </h1>
          <p className="section-copy md:text-lg">
            Choose desktop, command-line, or both. Start simple, then expand when your workflow
            grows.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/docs">Read CLI docs</Link>
            </Button>
            <Button asChild>
              <Link href="/downloads">Open downloads</Link>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider">
          <PricingClient />
        </section>

        <section className="section-block section-divider grid gap-4 md:grid-cols-3">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>App purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for visual editing and quick export checks.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>CLI purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for repeat batches and script-driven image processing.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>App + CLI purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best when you want both visual review and command-line speed.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="section-block section-divider pt-8">
          <PricingPolicyFaq />
        </section>
      </main>

      <StickyCta
        title="Need a plan decision?"
        description="Start with one plan, upgrade anytime."
        primaryLabel="Buy now"
        primaryHref="/pricing"
        secondaryLabel="Download first"
        secondaryHref="/downloads"
      />
    </>
  );
}
