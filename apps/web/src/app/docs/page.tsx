import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import CommandBlock from "@/components/marketing/CommandBlock";
import StickyCta from "@/components/marketing/StickyCta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLI_ACTIVATE_CMD,
  CLI_COMMAND_REFERENCE,
  CLI_EXIT_CODES,
  CLI_HELP_CMD,
  CLI_INSTALL_CMD,
  CLI_MODEL_ENSURE_CMD,
  CLI_REMOVE_CMD,
  CLI_REMOVE_WITH_DESKTOP_REQUIREMENT_CMD,
  CLI_STATUS_CMD,
  CLI_VERSION_CMD,
} from "@/content/cli-docs";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

const CLI_REMOVE_HELP_CMD = "rmbg remove --help";

export const metadata: Metadata = buildPageMetadata({
  title: "CLI Docs: Install, Activate, and Command Reference",
  description:
    "Practical CLI docs for Local Background Remover: installation, activation, first-run commands, and command reference.",
  path: "/docs",
});

export default function DocsPage() {
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
        name: "CLI Docs",
        item: "https://local.backgroundrm.com/docs",
      },
    ],
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Install and run Local Background Remover CLI",
    description:
      "Install the CLI, activate a key, ensure the model is available locally, and run your first background removal command.",
    step: [
      {
        "@type": "HowToStep",
        name: "Install the CLI",
        text: CLI_INSTALL_CMD,
      },
      {
        "@type": "HowToStep",
        name: "Verify your installation",
        text: CLI_VERSION_CMD,
      },
      {
        "@type": "HowToStep",
        name: "Activate your CLI key",
        text: CLI_ACTIVATE_CMD,
      },
      {
        "@type": "HowToStep",
        name: "Ensure model files",
        text: CLI_MODEL_ENSURE_CMD,
      },
      {
        "@type": "HowToStep",
        name: "Run background removal",
        text: CLI_REMOVE_CMD,
      },
    ],
  };

  return (
    <>
      <Script id="docs-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <Script id="docs-howto-jsonld" type="application/ld+json">
        {serializeJsonLd(howToJsonLd)}
      </Script>

      <main className="site-frame flex flex-col gap-0 pb-36">
        <section className="section-block flex flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            CLI docs
          </Badge>
          <h1 className="display-title md:text-5xl">
            Install, activate, and run the CLI with confidence.
          </h1>
          <p className="section-copy md:text-lg">
            Follow this guide in order: install, activate, verify, then run your first image.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/downloads">Open downloads</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Get CLI license</Link>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider flex flex-col gap-4">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>1) Install CLI</CardTitle>
              <CardDescription>Run installer and verify the binary.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CommandBlock command={CLI_INSTALL_CMD} />
              <CommandBlock command={CLI_VERSION_CMD} />
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>2) Activate license</CardTitle>
              <CardDescription>Activate your CLI key on this machine.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CommandBlock command={CLI_ACTIVATE_CMD} />
              <CommandBlock command={CLI_STATUS_CMD} />
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>3) Run first image</CardTitle>
              <CardDescription>Ensure model files, then process an input image.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CommandBlock command={CLI_MODEL_ENSURE_CMD} />
              <CommandBlock command={CLI_REMOVE_CMD} />
            </CardContent>
          </Card>
        </section>

        <section className="section-block section-divider flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="section-title">Command reference</h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Core commands you will use most often.
            </p>
          </div>

          {CLI_COMMAND_REFERENCE.map((entry) => (
            <Card key={entry.command} className="bg-card/95">
              <CardHeader>
                <CardTitle className="text-base">{entry.purpose}</CardTitle>
                <CardDescription>{entry.notes}</CardDescription>
              </CardHeader>
              <CardContent>
                <CommandBlock command={entry.command} />
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="section-block section-divider flex flex-col gap-4">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>Desktop + CLI workflow</CardTitle>
              <CardDescription>
                For bundle workflows, require both surfaces before processing.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Alert>
                <AlertTitle>Use both licenses for bundle workflows</AlertTitle>
                <AlertDescription>
                  Require desktop and CLI surfaces when your automation depends on both.
                </AlertDescription>
              </Alert>
              <CommandBlock command={CLI_REMOVE_WITH_DESKTOP_REQUIREMENT_CMD} />
            </CardContent>
          </Card>
        </section>

        <section className="section-block section-divider flex flex-col gap-4">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>Exit codes</CardTitle>
              <CardDescription>Use these for shell scripts and automation logic.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              {CLI_EXIT_CODES.map((entry) => (
                <p key={entry.code}>
                  <code className="mr-1 font-mono text-foreground">{entry.code}</code>
                  {entry.reason}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle>Built-in help</CardTitle>
              <CardDescription>See every flag directly from the CLI.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CommandBlock command={CLI_HELP_CMD} />
              <CommandBlock command={CLI_REMOVE_HELP_CMD} />
            </CardContent>
          </Card>
        </section>
      </main>

      <StickyCta
        title="Ready to run your first command?"
        description="Install the CLI, activate your key, and process your first image locally."
        primaryLabel="Open downloads"
        primaryHref="/downloads"
        secondaryLabel="View pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}
