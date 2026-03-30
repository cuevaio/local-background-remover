import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLI_ACTIVATE_CMD, CLI_INSTALL_CMD } from "@/content/cli-docs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Purchase Complete: Activation Steps",
  description:
    "Your purchase is complete. Activate your app or command-line access and start processing.",
  path: "/thank-you",
  noindex: true,
});

export default function ThankYouPage() {
  return (
    <main className="site-frame flex flex-col gap-0 pb-20">
      <section className="section-block flex flex-col gap-4">
        <Badge variant="outline" className="w-fit bg-card">
          Purchase confirmed
        </Badge>
        <h1 className="display-title md:text-5xl">
          Thanks for your Local Background Remover purchase.
        </h1>
        <p className="section-copy md:text-lg">
          Install your preferred workflow, activate your purchase, and start processing.
        </p>
      </section>

      <section className="section-block section-divider pt-8">
        <Alert>
          <AlertTitle>Bundle reminder</AlertTitle>
          <AlertDescription>
            If you purchased App + CLI, activate both parts to use the full bundle workflow.
          </AlertDescription>
        </Alert>
      </section>

      <section className="section-block section-divider">
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle>Next steps checklist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>1. Install CLI:</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm text-foreground">
              {CLI_INSTALL_CMD}
            </pre>
            <p>2. Copy your key from your purchase email.</p>
            <p>3. Activate command-line access:</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm text-foreground">
              {CLI_ACTIVATE_CMD}
            </pre>
            <p>4. Activate desktop access in the app license screen.</p>
          </CardContent>
        </Card>
      </section>

      <section className="section-block section-divider pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/downloads">Open Downloads</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Review pricing plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">CLI docs</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
