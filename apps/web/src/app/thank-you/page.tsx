import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

const CLI_ACTIVATE_CMD = "rmbg license activate --key YOUR_KEY --surface cli";

export const metadata: Metadata = buildPageMetadata({
  title: "Purchase Complete: Activation Steps",
  description:
    "Your purchase is complete. Activate App and/or CLI keys to unlock runtime usage.",
  path: "/thank-you",
  noindex: true,
});

export default function ThankYouPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pb-14 pt-12 md:px-8 md:pt-16">
      <section className="flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit">
          Purchase confirmed
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Thanks for your Local Background Remover purchase.
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Downloads are public, and runtime usage unlocks after activation in each matching
          surface.
        </p>
      </section>

      <Alert>
        <AlertTitle>Bundle reminder</AlertTitle>
        <AlertDescription>
          If you purchased App + CLI, activate both keys before desktop processing.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Next steps checklist</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            1. Install CLI: <code>curl -fsSL https://local.backgroundrm.com/install | bash</code>
          </p>
          <p>2. Copy key(s) from your Polar purchase email.</p>
          <p>3. Activate CLI key in terminal:</p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-foreground">
            {CLI_ACTIVATE_CMD}
          </pre>
          <p>4. Activate App key in desktop from the License panel.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href="/downloads">Open Downloads</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pricing">Review pricing plans</Link>
        </Button>
      </div>
    </main>
  );
}
