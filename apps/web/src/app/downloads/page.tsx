import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

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
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Downloads and Install Guide",
  description:
    "Download the desktop app or command-line tool and start processing in minutes.",
  path: "/downloads",
});

export default function DownloadsPage() {
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

      <main className="site-frame flex flex-col gap-0 pb-36">
        <section className="section-block flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-card">
            Download and get started
          </Badge>
          <h1 className="display-title md:text-5xl">
            Install first, unlock when you are ready.
          </h1>
          <p className="section-copy md:text-lg">
            Pick desktop or command line, install, then activate your purchase to start processing.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/docs">Open CLI docs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Need a key?</Link>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider">
          <Tabs defaultValue="cli" className="w-full">
            <TabsList>
              <TabsTrigger value="cli">CLI install</TabsTrigger>
              <TabsTrigger value="desktop">Desktop install</TabsTrigger>
            </TabsList>

            <TabsContent value="cli">
              <Card>
                <CardHeader>
                  <CardTitle>CLI download and install (macOS)</CardTitle>
                  <CardDescription>Install globally, then verify the binary.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm">
                    {CLI_INSTALL_CMD}
                  </pre>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm">
                    {CLI_VERSION_CMD}
                  </pre>
                  <Alert>
                    <AlertTitle>Unlock before processing</AlertTitle>
                    <AlertDescription>
                      Activate your CLI purchase before running `model ensure` or `remove`.
                    </AlertDescription>
                  </Alert>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm">
                    {CLI_ACTIVATE_CMD}
                  </pre>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm">
                    {CLI_STATUS_CMD}
                  </pre>
                  <Button asChild variant="outline" className="w-fit">
                    <Link href="/docs">Read full CLI command docs</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="desktop">
              <Card>
                <CardHeader>
                  <CardTitle>Desktop app download</CardTitle>
                  <CardDescription>Install, then unlock inside the app.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Install the desktop app, open the license screen, and paste your App key.
                  </p>
                  <Alert>
                    <AlertTitle>Bundle reminder</AlertTitle>
                    <AlertDescription>
                      If you bought App + CLI, activate both parts to use the full bundle workflow.
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
              <p>2. Activate in desktop or command line.</p>
              <p>3. Run your first image.</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                {CLI_MODEL_ENSURE_CMD}
              </pre>
              <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-xs text-foreground">
                {CLI_REMOVE_CMD}
              </pre>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>Need a key first?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Compare App, CLI, and Bundle plans before activation.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href="/pricing">Open pricing</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/docs">CLI docs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <StickyCta
        title="Have the installer?"
        description="Choose your plan and unlock your workflow when ready."
        primaryLabel="Compare pricing"
        primaryHref="/pricing"
        secondaryLabel="Home"
        secondaryHref="/"
      />
    </>
  );
}
