import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import AutomationChats from "@/components/marketing/AutomationChats";
import BeforeAfterShowcase from "@/components/marketing/BeforeAfterShowcase";
import LogoStrip from "@/components/marketing/LogoStrip";
import PricingPolicyFaq from "@/components/marketing/PricingPolicyFaq";
import ProofStrip from "@/components/marketing/ProofStrip";
import StickyCta from "@/components/marketing/StickyCta";
import WorkflowComparison from "@/components/marketing/WorkflowComparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

type Testimonial = {
  quote: string;
  byline: string;
  role: string;
  photoUrl: string;
};

type Faq = {
  q: string;
  a: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The CLI replaced a chain of brittle scripts. We now process 300+ SKU images in one pass.",
    byline: "Elena M., ecommerce operations",
    role: "Operations lead",
    photoUrl: "https://i.pravatar.cc/240?img=31",
  },
  {
    quote:
      "The app makes review rounds much faster. No uploads, no cloud account switching, no surprises.",
    byline: "Marco L., product design lead",
    role: "Product design lead",
    photoUrl: "https://i.pravatar.cc/240?img=59",
  },
  {
    quote:
      "Offline after activation is exactly what we needed for travel-heavy production weeks.",
    byline: "Priya S., indie founder",
    role: "Founder",
    photoUrl: "https://i.pravatar.cc/240?img=47",
  },
];

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

      <main className="pb-32">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-14 pt-14 md:px-8 md:pt-20">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-5">
              <Badge variant="secondary" className="w-fit">
                Offline background remover for production teams
              </Badge>
              <div className="flex flex-col gap-3">
                <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                  Remove backgrounds locally with desktop speed and CLI control.
                </h1>
                <p className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
                  Download publicly, activate the key(s) you need, and keep working even when
                  you are offline. Choose App, CLI, or both based on your workflow.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/pricing">View one-time pricing</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/downloads">Start with downloads</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Local processing</Badge>
                <Badge variant="outline">Offline after activation</Badge>
                <Badge variant="outline">No subscription required</Badge>
              </div>
            </div>

            <Card className="border-primary/25 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>How activation works</CardTitle>
                <CardDescription>
                  Keep this flow simple and predictable across App and CLI.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                  1. Pick a one-time plan on the pricing page.<br />
                  2. Receive your key(s) through Polar purchase confirmation.<br />
                  3. Activate in the matching surface and start processing.
                </p>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-foreground">
                  Bundle includes <strong>two keys</strong> (App + CLI). Desktop processing
                  requires both active keys.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <ProofStrip />
        <LogoStrip />

        <section className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-6 px-5 md:px-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Choose the workflow that matches how your team ships
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Start with one surface or use both for automation plus visual QA before delivery.
            </p>
          </div>
          <WorkflowComparison />
        </section>

        <BeforeAfterShowcase />

        <section className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-5 px-5 md:px-8">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Used by teams that care about control and reliability
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <Card key={item.byline} className="bg-card/85">
                <CardContent className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.photoUrl}
                      alt={`${item.byline} testimonial portrait`}
                      className="size-12 rounded-full border border-border object-cover"
                      loading="lazy"
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{item.byline}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">&quot;{item.quote}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <AutomationChats />

        <section className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-6 px-5 md:px-8">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Practical purchase questions, answered early
          </h2>
          <PricingPolicyFaq />
        </section>

        <section className="mx-auto mt-14 w-full max-w-6xl px-5 pb-6 md:px-8">
          <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
            <CardContent className="flex flex-col gap-5 pt-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold tracking-tight">Ready to process faster?</h3>
                <p className="text-sm text-muted-foreground">
                  Buy once, activate your key(s), and ship clean assets from desktop or terminal.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/pricing">Open pricing plans</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="mx-auto mt-6 w-[min(94%,72rem)]" />

        <footer className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 text-sm text-muted-foreground md:px-8">
          Local Background Remover: public installers, license-gated runtime, and offline
          operation after activation.
        </footer>
      </main>

      <StickyCta
        title="Buy once. Process locally."
        description="Compare App, CLI, and Bundle plans with clear activation requirements."
        primaryLabel="View pricing"
        primaryHref="/pricing"
        secondaryLabel="Open downloads"
        secondaryHref="/downloads"
      />
    </>
  );
}
