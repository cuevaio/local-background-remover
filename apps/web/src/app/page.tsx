import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
import AutomationChats from "@/components/marketing/AutomationChats";
import BeforeAfterShowcase from "@/components/marketing/BeforeAfterShowcase";
import InputOptionsSection from "@/components/marketing/InputOptionsSection";
import PricingPolicyFaq from "@/components/marketing/PricingPolicyFaq";
import ProofStrip from "@/components/marketing/ProofStrip";
import QuoteSection from "@/components/marketing/QuoteSection";
import StickyCta from "@/components/marketing/StickyCta";
import TestimonialMosaic from "@/components/marketing/TestimonialMosaic";
import WorkflowComparison from "@/components/marketing/WorkflowComparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLI_ACTIVATE_CMD, CLI_INSTALL_CMD, CLI_REMOVE_CMD } from "@/content/cli-docs";
import {
  mergeExperimentToken,
  readSingleParam,
} from "@/lib/experiments/attribution";
import {
  evaluateHomeAssignments,
  toFlagValues,
} from "@/lib/experiments/flags";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

type Faq = {
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    q: "Why does App + CLI include two keys?",
    a: "The bundle includes desktop access and command-line access, so you can use both workflows together.",
  },
  {
    q: "Can I share installers?",
    a: "Yes. Anyone can download, and paid features start after activation on your machine.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. After activation, you can keep working even when your internet is unstable.",
  },
  {
    q: "What does desktop processing require?",
    a: "For the full desktop + command-line bundle workflow, both parts need to be activated.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Local Background Removal for Indie Builders",
  description:
    "Clean image cutouts on-device with one-time pricing. Use desktop app, CLI, or both for private, reliable shipping.",
  path: "/",
});

type HomePageProps = {
  searchParams?: Promise<{
    exp?: string | string[];
  }>;
};

const HOME_HERO_TITLE: Record<string, string> = {
  control: "Clean cutouts in seconds.",
  outcome: "Launch-ready product images in minutes.",
  privacy: "Private background removal for builders who move fast.",
};

const HOME_PRIMARY_CTA_LABEL: Record<string, string> = {
  control: "Try it now",
  download_free: "Download free installer",
  start_downloads: "Start with downloads",
};

const HOME_STICKY_LABELS: Record<string, { primary: string; secondary: string }> = {
  control: { primary: "View pricing", secondary: "Open downloads" },
  compare_install: { primary: "Compare plans", secondary: "Install first" },
  buy_get: { primary: "Buy once", secondary: "Get installer" },
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const assignments = await evaluateHomeAssignments();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const incomingExp = readSingleParam(resolvedSearchParams?.exp);
  const exp = mergeExperimentToken(incomingExp, assignments);

  const heroTitle = HOME_HERO_TITLE[assignments.homeHeroHeadline];
  const primaryCtaLabel = HOME_PRIMARY_CTA_LABEL[assignments.homePrimaryCta];
  const stickyLabels = HOME_STICKY_LABELS[assignments.stickyCtaCopy];

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Local Background Remover",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "macOS",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      lowPrice: "6.99",
      highPrice: "9.99",
    },
    description:
      "Local, private background remover for independent builders using desktop and CLI workflows with one-time pricing.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <Script id="home-software-application-jsonld" type="application/ld+json">
        {serializeJsonLd(softwareApplicationJsonLd)}
      </Script>
      <Script id="home-faq-jsonld" type="application/ld+json">
        {serializeJsonLd(faqJsonLd)}
      </Script>
      <FlagValues values={toFlagValues(assignments)} />
      <ExperimentExposureTracker
        exposures={[
          {
            experimentKey: "home-hero-headline",
            variant: assignments.homeHeroHeadline,
            page: EXPERIMENT_PAGE.HOME,
            slot: "home.hero.title",
          },
          {
            experimentKey: "home-primary-cta",
            variant: assignments.homePrimaryCta,
            page: EXPERIMENT_PAGE.HOME,
            slot: "home.hero.primary_cta",
          },
          {
            experimentKey: "sticky-cta-copy",
            variant: assignments.stickyCtaCopy,
            page: EXPERIMENT_PAGE.HOME,
            slot: "home.sticky_cta",
          },
        ]}
      />

      <main className="site-frame">
        <BeforeAfterShowcase className="pb-6 md:pb-8" />

        <section className="section-block pt-6 md:pt-8">
          <div className="flex flex-col gap-5">
            <Badge variant="outline" className="w-fit bg-card">
              Local-first cutouts
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="display-title">{heroTitle}</h1>
              <p className="section-copy">
                Build cleaner product shots, profile photos, and launch assets with local
                workflows made for independent makers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/downloads">{primaryCtaLabel}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">CLI docs</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-card">
                  Works with people + products
                </Badge>
                <Badge variant="outline" className="bg-card">
                  Batch-friendly
                </Badge>
                <Badge variant="outline" className="bg-card">
                  Private on your device
                </Badge>
            </div>
          </div>
        </section>

        <ProofStrip />

        <InputOptionsSection />

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">Pick the workflow that matches your pace</h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Go app-only, CLI-only, or both for scriptable output plus quick visual QA.
            </p>
          </div>
          <WorkflowComparison />
        </section>

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">Command-line quickstart in three commands</h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Download, activate, and process your first image locally.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>Install</CardTitle>
                <CardDescription>macOS one-liner installer.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                  {CLI_INSTALL_CMD}
                </pre>
              </CardContent>
            </Card>
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>Activate</CardTitle>
                <CardDescription>Enable command access.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                  {CLI_ACTIVATE_CMD}
                </pre>
              </CardContent>
            </Card>
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>Use</CardTitle>
                <CardDescription>Remove one background to verify setup.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                  {CLI_REMOVE_CMD}
                </pre>
              </CardContent>
            </Card>
          </div>
          <div>
            <Button asChild variant="outline">
              <Link href="/docs">Open full command docs</Link>
            </Button>
          </div>
        </section>
        <QuoteSection />

        <TestimonialMosaic />

        <AutomationChats />

        <section className="section-block section-divider flex flex-col gap-6">
          <h2 className="section-title">Questions before checkout</h2>
          <PricingPolicyFaq />
        </section>
      </main>

      <StickyCta
        title="Ship clean visuals faster."
        description="Buy once. Run local in desktop + CLI."
        primaryLabel={stickyLabels.primary}
        primaryHref="/pricing"
        secondaryLabel={stickyLabels.secondary}
        secondaryHref="/downloads"
      />
    </>
  );
}
