import type { Metadata } from "next";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
import ExpLink from "@/components/experiments/ExpLink";
import PricingPolicyFaq from "@/components/marketing/PricingPolicyFaq";
import StickyCta from "@/components/marketing/StickyCta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mergeExperimentToken,
  readSingleParam,
} from "@/lib/experiments/attribution";
import {
  evaluatePricingAssignments,
  toFlagValues,
} from "@/lib/experiments/flags";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

import PricingClient from "./PricingClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Background Remover Pricing for Mac",
  description:
    "Compare one-time plans for an offline background remover for Mac, including private local processing and optional batch CLI automation.",
  path: "/pricing",
});

type PricingPageProps = {
  searchParams?: Promise<{
    exp?: string | string[];
  }>;
};

const PRICING_HERO_COPY: Record<string, { title: string; description: string }> = {
  control: {
    title: "Choose the plan that fits how you want to work.",
    description:
      "Most people should start with the Mac app. Pick the CLI only if you want scripts, batches, or coding-agent automation.",
  },
  one_time_mac: {
    title: "One payment. Your Mac app is ready when you are.",
    description:
      "Get private background removal on your Mac with one-time pricing, then add the CLI later if you need automation.",
  },
  app_first: {
    title: "Start simple with the app. Add the CLI only if you need it.",
    description:
      "The app is the easiest way to get great results. The CLI is there for developers, scripts, and coding agents.",
  },
};

const PRICING_STICKY_LABELS: Record<string, { primary: string; secondary: string }> = {
  control: { primary: "Buy now", secondary: "See install steps" },
  plans_first: { primary: "Compare plans", secondary: "Install later" },
  pricing_docs: { primary: "Buy once", secondary: "CLI docs" },
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const assignments = await evaluatePricingAssignments();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const incomingExp = readSingleParam(resolvedSearchParams?.exp);
  const exp = mergeExperimentToken(incomingExp, { pricingHeroCopy: assignments.pricingHeroCopy });

  const heroCopy = PRICING_HERO_COPY[assignments.pricingHeroCopy];
  const stickyLabels = PRICING_STICKY_LABELS[assignments.stickyCtaCopy];

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
      <FlagValues values={toFlagValues(assignments)} />
      <ExperimentExposureTracker
        exposures={[
          {
            experimentKey: "pricing-hero-copy",
            variant: assignments.pricingHeroCopy,
            page: EXPERIMENT_PAGE.PRICING,
            slot: "pricing.hero.copy",
          },
        ]}
      />

      <main className="site-frame flex flex-col gap-0 pb-36">
        <section className="section-block flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-card">
            One-time plans
          </Badge>
          <h1 className="display-title md:text-5xl">{heroCopy.title}</h1>
          <p className="section-copy md:text-lg">{heroCopy.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <ExpLink href="/docs">CLI docs</ExpLink>
            </Button>
            <Button asChild>
              <ExpLink href="/downloads">See install steps</ExpLink>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider">
          <PricingClient ctaVariant={assignments.pricingPlanCta} exp={exp} />
        </section>

        <section className="section-block section-divider grid gap-4 md:grid-cols-3">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>App purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for most buyers who want the simplest Mac app workflow.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>CLI purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for developers who want scripts, repeat batches, and coding agents.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>App + CLI purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best if you want the app for day-to-day work and the CLI for automation.
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
        description="Choose a plan first, then install whenever you are ready."
        primaryLabel={stickyLabels.primary}
        primaryHref="/pricing"
        secondaryLabel={stickyLabels.secondary}
        secondaryHref={assignments.stickyCtaCopy === "pricing_docs" ? "/docs" : "/downloads"}
      />
    </>
  );
}
