import type { Metadata } from "next";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
import TrackedExpLink from "@/components/analytics/TrackedExpLink";
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
import SiteFooter from "@/components/marketing/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomePageCopy } from "@/content/home/heading-copy";
import {
  evaluateHomeAssignments,
  toFlagValues,
} from "@/lib/experiments/flags";
import { serializeExperimentToken, withExpParam } from "@/lib/experiments/attribution";
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
    "Remove image backgrounds on your Mac with private local processing, batch workflows, and one-time pricing. Great for product photos, portraits, and transparent PNG exports.",
  path: "/",
});

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

export default async function HomePage() {
  const assignments = await evaluateHomeAssignments();
  const pageCopy = getHomePageCopy(assignments);
  const exp = serializeExperimentToken({ homeHeroHeadline: assignments.homeHeroHeadline });

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
      "Offline background remover for Mac with one-time pricing, batch image cleanup, and private local processing for product photos, portraits, and transparent PNG exports.",
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
        ]}
      />

      <main className="site-frame">
        <BeforeAfterShowcase className="pb-6 md:pb-8" copy={pageCopy.beforeAfter} />

        <section className="section-block pt-6 md:pt-8">
          <div className="flex flex-col gap-5">
            <Badge variant="outline" className="w-fit bg-card">
              {pageCopy.hero.badge}
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="display-title">{pageCopy.hero.title}</h1>
              <p className="section-copy">{pageCopy.hero.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <TrackedExpLink href={withExpParam("/pricing", exp)} slot="home.hero.primary" label={primaryCtaLabel}>
                  {primaryCtaLabel}
                </TrackedExpLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <TrackedExpLink href={withExpParam("/gallery", exp)} slot="home.hero.examples" label="See examples">
                  See examples
                </TrackedExpLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <TrackedExpLink href={withExpParam("/downloads", exp)} slot="home.hero.install" label="Install anytime">
                  Install anytime
                </TrackedExpLink>
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
                  Offline and private on your Mac
                </Badge>
                <Badge variant="outline" className="bg-card">
                  Batch background removal
                </Badge>
            </div>
          </div>
        </section>

        <ProofStrip />

        <InputOptionsSection copy={pageCopy.inputOptions} />

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">{pageCopy.workflowComparison.title}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {pageCopy.workflowComparison.description}
            </p>
          </div>
          <WorkflowComparison copy={pageCopy.workflowComparison} />
        </section>

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">{pageCopy.cliQuickstart.sectionTitle}</h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {pageCopy.cliQuickstart.sectionDescription}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>{pageCopy.cliQuickstart.commandCardTitle}</CardTitle>
                <CardDescription>{pageCopy.cliQuickstart.commandCardDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                  {QUICKSTART_COMMAND}
                </pre>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{pageCopy.cliQuickstart.resultTitle}</p>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs leading-6 text-foreground whitespace-pre-wrap break-all">
                    {JSON.stringify(QUICKSTART_RESULT, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <QuickstartComparison copy={pageCopy.cliQuickstart} />
          </div>
          <div>
            <Button asChild variant="outline">
              <TrackedExpLink href={withExpParam("/docs", exp)} slot="home.cli.docs" label="Open CLI docs">
                Open CLI docs
              </TrackedExpLink>
            </Button>
          </div>
        </section>

        <AutomationChats copy={pageCopy.automationChats} />

        <QuoteSection copy={pageCopy.quote} />

        <TestimonialMosaic copy={pageCopy.testimonials} />

        <section className="section-block section-divider flex flex-col gap-6">
          <h2 className="section-title">{pageCopy.pricingFaq.sectionTitle}</h2>
          <PricingPolicyFaq copy={pageCopy.pricingFaq} />
        </section>

      </main>

      <div className="site-frame">
        <SiteFooter copy={pageCopy.footer} />
      </div>

      <StickyCta
        title={pageCopy.stickyCta.title}
        description={pageCopy.stickyCta.description}
        primaryLabel={stickyLabels.primary}
        primaryHref={withExpParam("/pricing", exp)}
        secondaryLabel={stickyLabels.secondary}
        secondaryHref={withExpParam(assignments.stickyCtaCopy === "pricing_docs" ? "/docs" : "/downloads", exp)}
      />
    </>
  );
}
