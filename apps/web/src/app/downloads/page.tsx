import type { Metadata } from "next";
import Script from "next/script";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
import TrackedExpLink from "@/components/analytics/TrackedExpLink";
import CommandBlock from "@/components/marketing/CommandBlock";
import StickyCta from "@/components/marketing/StickyCta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CLI_ACTIVATE_CMD,
  CLI_INSTALL_CMD,
  CLI_MODEL_ENSURE_CMD,
  CLI_REMOVE_CMD,
  CLI_STATUS_CMD,
  CLI_VERSION_CMD,
} from "@/content/cli-docs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  evaluateDownloadsAssignments,
  toFlagValues,
} from "@/lib/experiments/flags";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Install Local Background Remover",
  description:
    "Install the Mac app or optional CLI. Compare plans first if you are still deciding what to buy.",
  path: "/downloads",
});

const DOWNLOADS_HERO_COPY: Record<string, { title: string; description: string }> = {
  control: {
    title: "Install anytime. Choose a plan when you are ready.",
    description:
      "This page is here when you need install steps. If you are still deciding, pricing is the better place to start.",
  },
  support_page: {
    title: "Use this page for install steps, not for choosing a plan.",
    description:
      "The app is the easiest place to start. The CLI is available too if you want scripts, batches, or coding-agent automation.",
  },
};

const DOWNLOADS_STICKY_LABELS: Record<string, { primary: string; secondary: string }> = {
  control: { primary: "Compare pricing", secondary: "Home" },
  plans_first: { primary: "Compare plans", secondary: "Home" },
  pricing_docs: { primary: "View pricing", secondary: "CLI docs" },
};

export default async function DownloadsPage() {
  const assignments = await evaluateDownloadsAssignments();

  const heroCopy = DOWNLOADS_HERO_COPY[assignments.downloadsHeroCopy];
  const stickyLabels = DOWNLOADS_STICKY_LABELS[assignments.stickyCtaCopy];

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
        name: "Downloads",
        item: "https://local.backgroundrm.com/downloads",
      },
    ],
  };

  return (
    <>
      <Script id="downloads-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <FlagValues values={toFlagValues(assignments)} />
      <ExperimentExposureTracker
        exposures={[
          {
            experimentKey: "downloads-hero-copy",
            variant: assignments.downloadsHeroCopy,
            page: EXPERIMENT_PAGE.DOWNLOADS,
            slot: "downloads.hero.copy",
          },
          {
            experimentKey: "sticky-cta-copy",
            variant: assignments.stickyCtaCopy,
            page: EXPERIMENT_PAGE.DOWNLOADS,
            slot: "downloads.sticky_cta",
          },
        ]}
      />

      <main className="site-frame flex flex-col gap-0 pb-36">
        <section className="section-block flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-card">
            Install and setup
          </Badge>
          <h1 className="display-title md:text-5xl">{heroCopy.title}</h1>
          <p className="section-copy md:text-lg">{heroCopy.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <TrackedExpLink href="/pricing" slot="downloads.hero.pricing" label="Compare plans first">
                Compare plans first
              </TrackedExpLink>
            </Button>
            <Button asChild variant="outline">
              <TrackedExpLink href="/docs" slot="downloads.hero.docs" label="CLI docs">
                CLI docs
              </TrackedExpLink>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider">
          <Tabs defaultValue="desktop" className="w-full">
            <TabsList>
              <TabsTrigger value="desktop">Desktop install</TabsTrigger>
              <TabsTrigger value="cli">CLI install</TabsTrigger>
            </TabsList>

            <TabsContent value="cli">
              <Card>
                <CardHeader>
                  <CardTitle>CLI install for developers</CardTitle>
                  <CardDescription>Use this if you want scripts, batches, or coding-agent automation.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <CommandBlock command={CLI_INSTALL_CMD} commandId="cli_install" />
                  <CommandBlock command={CLI_VERSION_CMD} commandId="cli_version" />
                  <Alert>
                    <AlertTitle>Unlock before processing</AlertTitle>
                    <AlertDescription>
                      Activate your CLI purchase before running background removal commands.
                    </AlertDescription>
                  </Alert>
                  <CommandBlock command={CLI_ACTIVATE_CMD} commandId="cli_activate" />
                  <CommandBlock command={CLI_STATUS_CMD} commandId="cli_status" />
                  <Button asChild variant="outline" className="w-fit">
                    <TrackedExpLink href="/docs" slot="downloads.cli.docs" label="Read full CLI command docs">
                      Read full CLI command docs
                    </TrackedExpLink>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="desktop">
              <Card>
                <CardHeader>
                  <CardTitle>Desktop app for most buyers</CardTitle>
                  <CardDescription>Install the Mac app, then unlock it after purchase.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Install the app, open the license screen, and paste your App key when you are ready to start processing.
                  </p>
                  <Alert>
                    <AlertTitle>Bundle reminder</AlertTitle>
                    <AlertDescription>
                      If you bought App + CLI, you will receive one app key and one CLI key.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section className="section-block section-divider grid gap-4 md:grid-cols-2">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>What to do after install</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>1. Get your key from your purchase email.</p>
              <p>2. Activate the app or the CLI, depending on your plan.</p>
              <p>3. Run your first image when you are ready.</p>
              <CommandBlock command={CLI_MODEL_ENSURE_CMD} commandId="cli_model_ensure" />
              <CommandBlock command={CLI_REMOVE_CMD} commandId="cli_remove" />
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>Need a key first?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Start with pricing if you are still deciding between the app, the CLI, or the bundle.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <TrackedExpLink href="/pricing" slot="downloads.key_first.pricing" label="Open pricing">
                    Open pricing
                  </TrackedExpLink>
                </Button>
                <Button asChild variant="outline">
                  <TrackedExpLink href="/docs" slot="downloads.key_first.docs" label="CLI docs">
                    CLI docs
                  </TrackedExpLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <StickyCta
        title="Have the installer?"
        description="Choose your plan first, then come back here when you want install steps."
        primaryLabel={stickyLabels.primary}
        primaryHref="/pricing"
        secondaryLabel={stickyLabels.secondary}
        secondaryHref={assignments.stickyCtaCopy === "pricing_docs" ? "/docs" : "/"}
      />
    </>
  );
}
