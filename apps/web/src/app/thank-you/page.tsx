import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import ThankYouTracker from "@/components/analytics/ThankYouTracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLI_ACTIVATE_CMD, CLI_INSTALL_CMD } from "@/content/cli-docs";
import { parseAttributionCookie, toAnalyticsAttribution, withExperiment, ATTRIBUTION_COOKIE } from "@/lib/analytics/attribution";
import { readSingleParam, withExpParam } from "@/lib/experiments/attribution";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Purchase Complete: Activation Steps",
  description:
    "Your purchase is complete. Check your email for license keys, then activate your app or command-line access and start processing.",
  path: "/thank-you",
  noindex: true,
});

type ThankYouPageProps = {
  searchParams?: Promise<{
    checkout_id?: string | string[];
    kind?: string | string[];
    exp?: string | string[];
  }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const kind = readSingleParam(resolvedSearchParams?.kind) || "unknown";
  const exp = readSingleParam(resolvedSearchParams?.exp) || "";
  const checkoutId = readSingleParam(resolvedSearchParams?.checkout_id) || "";
  const cookieStore = await cookies();
  const attribution = withExperiment(
    parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE)?.value),
    exp,
  );

  return (
    <main className="site-frame flex flex-col gap-0 pb-20">
      <ThankYouTracker
        kind={kind}
        exp={exp}
        checkoutId={checkoutId}
        attribution={toAnalyticsAttribution(attribution)}
      />
      <section className="section-block flex flex-col gap-4">
        <Badge variant="outline" className="w-fit bg-card">
          Purchase confirmed
        </Badge>
        <h1 className="display-title md:text-5xl">
          Thanks for your Local Background Remover purchase.
        </h1>
        <p className="section-copy md:text-lg">
          You’ll receive an email with your license keys after purchase. Start with the Mac app if you want the simplest path, or use the CLI if you bought it for scripts or coding agents.
        </p>
      </section>

      <section className="section-block section-divider pt-8">
        <Alert>
          <AlertTitle>Bundle reminder</AlertTitle>
          <AlertDescription>
            If you purchased App + CLI, you will receive one app key and one CLI key.
          </AlertDescription>
        </Alert>
      </section>

      <section className="section-block section-divider">
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle>Next steps checklist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>1. Install the app or the CLI, depending on what you bought.</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm text-foreground">
              {CLI_INSTALL_CMD}
            </pre>
            <p>2. Get your license keys from your purchase email.</p>
            <p>3. Activate CLI access if you bought it:</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/50 px-3 py-3 font-mono text-sm text-foreground">
              {CLI_ACTIVATE_CMD}
            </pre>
            <p>4. Activate desktop access inside the app if you bought the app or bundle.</p>
          </CardContent>
        </Card>
      </section>

      <section className="section-block section-divider pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={withExpParam("/downloads", exp)}>Open Downloads</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={withExpParam("/pricing", exp)}>Review pricing plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={withExpParam("/docs", exp)}>CLI docs</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
