import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import AutomationChats from "@/components/marketing/AutomationChats";
import BeforeAfterShowcase from "@/components/marketing/BeforeAfterShowcase";
import HeroExamplePanel from "@/components/marketing/HeroExamplePanel";
import PricingPolicyFaq from "@/components/marketing/PricingPolicyFaq";
import ProofStrip from "@/components/marketing/ProofStrip";
import QuoteSection from "@/components/marketing/QuoteSection";
import SiteFooter from "@/components/marketing/SiteFooter";
import StickyCta from "@/components/marketing/StickyCta";
import TestimonialMosaic from "@/components/marketing/TestimonialMosaic";
import WorkflowComparison from "@/components/marketing/WorkflowComparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLI_ACTIVATE_CMD, CLI_INSTALL_CMD, CLI_REMOVE_CMD } from "@/content/cli-docs";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

type Faq = {
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    q: "Why does App + CLI include two keys?",
    a: "App and CLI are separate entitlements. The app key unlocks desktop usage, and the CLI key unlocks terminal usage.",
  },
  {
    q: "Can I share installers?",
    a: "Yes. Downloads are public. Runtime features only unlock after valid activation on your machine.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. After activation, each key is cached locally and remains usable within active and grace windows.",
  },
  {
    q: "What does desktop processing require?",
    a: "Desktop processing requires both active keys: App and CLI.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Private Background Removal for App and CLI Workflows",
  description:
    "Remove backgrounds on-device with one-time pricing. Choose desktop app, CLI, or both for private, reliable image processing.",
  path: "/",
});

export default function HomePage() {
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
      "Local, private background remover with desktop and CLI workflows and one-time purchase plans.",
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

      <main className="site-frame">
        <section className="section-block">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-5">
              <Badge variant="outline" className="w-fit bg-card">
                Fast local background remover
              </Badge>
              <div className="flex flex-col gap-4">
                <h1 className="display-title">Remove image backgrounds in seconds.</h1>
                <p className="section-copy">
                  Create clean product photos, profile images, and marketing assets with desktop
                  and CLI workflows that feel simple from day one.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/downloads">Try it now</Link>
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

            <HeroExamplePanel />
          </div>
        </section>

        <ProofStrip />

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">Choose the workflow that matches how your team ships</h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Start with one surface or use both for automation plus visual QA before delivery.
            </p>
          </div>
          <WorkflowComparison />
        </section>

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">CLI quickstart in three commands</h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Install publicly, activate your key, and process your first image locally.
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
                <CardDescription>Unlock runtime commands.</CardDescription>
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

        <BeforeAfterShowcase />

        <QuoteSection />

        <TestimonialMosaic />

        <AutomationChats />

        <section className="section-block section-divider flex flex-col gap-6">
          <h2 className="section-title">Practical purchase questions, answered early</h2>
          <PricingPolicyFaq />
        </section>

        <SiteFooter />
      </main>

      <StickyCta
        title="Create clean images faster."
        description="Desktop + CLI for simple background removal."
        primaryLabel="View pricing"
        primaryHref="/pricing"
        secondaryLabel="Open downloads"
        secondaryHref="/downloads"
      />
    </>
  );
}
