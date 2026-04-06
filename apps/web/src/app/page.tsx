import type { Metadata } from "next";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
import ExpLink from "@/components/experiments/ExpLink";
import AutomationChats from "@/components/marketing/AutomationChats";
import BeforeAfterShowcase from "@/components/marketing/BeforeAfterShowcase";
import InputOptionsSection from "@/components/marketing/InputOptionsSection";
import PricingPolicyFaq from "@/components/marketing/PricingPolicyFaq";
import ProofStrip from "@/components/marketing/ProofStrip";
import QuickstartComparison from "@/components/marketing/QuickstartComparison";
import QuoteSection from "@/components/marketing/QuoteSection";
import StickyCta from "@/components/marketing/StickyCta";
import TestimonialMosaic from "@/components/marketing/TestimonialMosaic";
import WorkflowComparison from "@/components/marketing/WorkflowComparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const QUICKSTART_COMMAND = "rmbg remove --input elon.webp --json";

const QUICKSTART_RESULT = {
  ok: true,
  input_path: "/rmbg/elon.webp",
  output_path: "/rmbg/elon_clean.png",
  duration_ms: 1142,
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
  title: "Offline Background Remover for Mac",
  description:
    "Remove backgrounds privately on your Mac with one-time pricing. Great for product photos, portraits, and optional CLI automation.",
  path: "/",
});

type HomePageProps = {
  searchParams?: Promise<{
    exp?: string | string[];
  }>;
};

const HOME_HERO_TITLE: Record<string, string> = {
  control: "Remove backgrounds privately on your Mac.",
  mac_app: "A simple Mac app for fast, clean cutouts.",
  product_photos: "Turn rough product photos into clean listing images.",
};

const HOME_PRIMARY_CTA_LABEL: Record<string, string> = {
  pricing_first: "See plans",
  see_plans: "Compare plans",
  buy_once: "Buy once",
};

const HOME_STICKY_LABELS: Record<string, { primary: string; secondary: string }> = {
  control: { primary: "View pricing", secondary: "See install steps" },
  plans_first: { primary: "Compare plans", secondary: "Install later" },
  pricing_docs: { primary: "View pricing", secondary: "CLI docs" },
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const assignments = await evaluateHomeAssignments();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const incomingExp = readSingleParam(resolvedSearchParams?.exp);
  const exp = mergeExperimentToken(incomingExp, assignments);

  const heroTitle = HOME_HERO_TITLE[assignments.homeHeroHeadline];
  const primaryCtaLabel = HOME_PRIMARY_CTA_LABEL[assignments.homePrimaryCta];
  const stickyLabels = HOME_STICKY_LABELS[assignments.stickyCtaCopy];
  const cliSectionTitle =
    assignments.homeCliEmphasis === "advanced_tool"
      ? "Need scripts or coding agents? Use the CLI."
      : "Optional CLI for scripts and coding agents";
  const cliSectionDescription =
    assignments.homeCliEmphasis === "advanced_tool"
      ? "The app is the easiest way to get started. When you need repeat batches or agent-driven automation, the local CLI is ready for that too."
      : "Most people should start with the app. If you also want local automation, the CLI works with scripts and coding agents.";

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
      "Private background remover for Mac with one-time pricing, a simple app for most buyers, and an optional CLI for automation.",
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
            experimentKey: "home-cli-emphasis",
            variant: assignments.homeCliEmphasis,
            page: EXPERIMENT_PAGE.HOME,
            slot: "home.cli.section",
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
              Local and private
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="display-title">{heroTitle}</h1>
              <p className="section-copy">
                Clean up product photos, portraits, and marketing images without upload-first tools. Start with the Mac app, and use the CLI only if you want advanced automation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <ExpLink href="/pricing">{primaryCtaLabel}</ExpLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <ExpLink href="/gallery">See examples</ExpLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <ExpLink href="/downloads">Install anytime</ExpLink>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-card">
                  Great for product photos and portraits
                </Badge>
                <Badge variant="outline" className="bg-card">
                  One-time pricing
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
              <h2 className="section-title">Choose the version that fits how you work</h2>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                The app is the easiest place to start. The CLI is there if you want scripts, batches, or coding-agent automation.
              </p>
            </div>
          <WorkflowComparison />
        </section>

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">{cliSectionTitle}</h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {cliSectionDescription}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>Example CLI command</CardTitle>
                <CardDescription>
                  A quick example for developers who want a machine-readable local workflow.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                  {QUICKSTART_COMMAND}
                </pre>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">What comes back</p>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs leading-6 text-foreground whitespace-pre-wrap break-all">
                    {JSON.stringify(QUICKSTART_RESULT, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <QuickstartComparison />
          </div>
          <div>
            <Button asChild variant="outline">
              <ExpLink href="/docs">Open CLI docs</ExpLink>
            </Button>
          </div>
        </section>

        <AutomationChats />

        <QuoteSection />

        <TestimonialMosaic />

        <section className="section-block section-divider flex flex-col gap-6">
          <h2 className="section-title">Questions before checkout</h2>
          <PricingPolicyFaq />
        </section>

      </main>

      <StickyCta
        title="Ready to clean up images without upload-first tools?"
        description="Start with pricing, then install when you are ready."
        primaryLabel={stickyLabels.primary}
        primaryHref="/pricing"
        secondaryLabel={stickyLabels.secondary}
        secondaryHref={assignments.stickyCtaCopy === "pricing_docs" ? "/docs" : "/downloads"}
      />
    </>
  );
}
