import type { Metadata } from "next";

import ExpLink from "@/components/experiments/ExpLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

const CUSTOMER_SEGMENTS = [
  {
    title: "Online sellers",
    detail:
      "Clean up listing images and product photos without sending inventory shots through upload-first tools.",
  },
  {
    title: "Freelance designers",
    detail:
      "Prepare client-ready visuals with control over quality, style consistency, and private files.",
  },
  {
    title: "Creators and marketers",
    detail:
      "Keep image cleanup fast and affordable with one-time pricing and a workflow you can manage yourself.",
  },
  {
    title: "Small creative studios",
    detail:
      "Use the app for visual checks and add the CLI later if your team needs repeatable automation.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Who Uses Local Background Remover",
  description:
    "See how sellers, designers, creators, and small studios use Local Background Remover for private image cleanup on Mac.",
  path: "/customers",
});

export default function CustomersPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Customer profiles
        </Badge>
        <h1 className="display-title md:text-5xl">Built for people who need cleaner images fast</h1>
        <p className="section-copy md:text-lg">
          Local Background Remover fits people who want private image cleanup on their Mac, clear one-time pricing, and an optional CLI when automation becomes useful.
        </p>
      </section>

      <section className="section-block section-divider grid gap-4 md:grid-cols-2">
        {CUSTOMER_SEGMENTS.map((segment) => (
          <Card key={segment.title} className="bg-card/95">
            <CardHeader>
              <CardTitle>{segment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{segment.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="section-block section-divider flex flex-col gap-4 md:max-w-3xl">
        <h2 className="section-title text-3xl md:text-4xl">Still deciding?</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          If you handle sensitive images and ship often, this approach keeps costs predictable and
          workflows private.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <ExpLink href="/pricing">View pricing</ExpLink>
          </Button>
          <Button asChild variant="outline">
            <ExpLink href="/contact">Talk to cueva.io</ExpLink>
          </Button>
        </div>
      </section>
    </main>
  );
}
