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
    "Compare App, CLI, and Bundle one-time pricing with clear key requirements and activation rules.",
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
            Pick the surface you need now and add the rest later.
          </h1>
          <p className="section-copy md:text-lg">
            Downloads are public. Runtime features unlock after activation for the matching
            surface. Bundle includes two keys and enables desktop processing when both are active.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/downloads">Read install guide</Link>
            </Button>
            <Button asChild>
              <Link href="/">See workflow overview</Link>
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
                Activate App key inside desktop app before processing.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>CLI purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activate CLI key with terminal command before model ensure/remove.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>App + CLI purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activate both keys in their surfaces to unlock full desktop + CLI workflow.
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
        description="Bundle is best for mixed desktop + automation workflows."
        primaryLabel="Buy now"
        primaryHref="/pricing"
        secondaryLabel="Download first"
        secondaryHref="/downloads"
      />
    </>
  );
}
