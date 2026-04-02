import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
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
  title: "One-Time Pricing for Local Background Remover",
  description:
    "Compare one-time plans for desktop, command-line, or both.",
  path: "/pricing",
});

type PricingPageProps = {
  searchParams?: Promise<{
    exp?: string | string[];
  }>;
};

const PRICING_HERO_COPY: Record<string, { title: string; description: string }> = {
  control: {
    title: "Pick what you need now and add more later.",
    description:
      "Choose desktop, command-line, or both. Start simple, then expand when your workflow grows.",
  },
  one_payment: {
    title: "One payment. Lifetime access.",
    description:
      "Choose desktop, command-line, or both and keep your workflow local with one-time pricing.",
  },
  upgrade_later: {
    title: "Start with one plan. Upgrade when your workflow grows.",
    description:
      "Begin with App or CLI today, then unlock the bundle whenever you need both surfaces.",
  },
};

const PRICING_STICKY_LABELS: Record<string, { primary: string; secondary: string }> = {
  control: { primary: "Buy now", secondary: "Download first" },
  compare_install: { primary: "Compare plans", secondary: "Install first" },
  buy_get: { primary: "Buy once", secondary: "Get installer" },
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const assignments = await evaluatePricingAssignments();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const incomingExp = readSingleParam(resolvedSearchParams?.exp);
  const exp = mergeExperimentToken(incomingExp, assignments);

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
          {
            experimentKey: "pricing-plan-cta",
            variant: assignments.pricingPlanCta,
            page: EXPERIMENT_PAGE.PRICING,
            slot: "pricing.plan.cta",
          },
          {
            experimentKey: "sticky-cta-copy",
            variant: assignments.stickyCtaCopy,
            page: EXPERIMENT_PAGE.PRICING,
            slot: "pricing.sticky_cta",
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
              <Link href="/docs">Read CLI docs</Link>
            </Button>
            <Button asChild>
              <Link href="/downloads">Open downloads</Link>
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
        primaryLabel={stickyLabels.primary}
        primaryHref="/pricing"
        secondaryLabel={stickyLabels.secondary}
        secondaryHref="/downloads"
      />
    </>
  );
}
