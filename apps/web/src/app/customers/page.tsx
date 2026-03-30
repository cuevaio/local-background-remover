import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

const CUSTOMER_SEGMENTS = [
  {
    title: "Indie hackers",
    detail:
      "Ship visual updates fast with repeatable local workflows and no subscription overhead.",
  },
  {
    title: "Solo designers",
    detail:
      "Prepare client-ready visuals with control over quality, style consistency, and private files.",
  },
  {
    title: "Bootstrapped founders",
    detail:
      "Keep image workflows lean with one-time pricing and practical tools you can run yourself.",
  },
  {
    title: "Small creative studios",
    detail:
      "Combine desktop review and CLI automation in one stack for faster weekly shipping.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Customers",
  description:
    "See how indie builders, designers, and small studios use Local Background Remover for private local workflows.",
  path: "/customers",
});

export default function CustomersPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Indie profiles
        </Badge>
        <h1 className="display-title md:text-5xl">Built for indie shippers</h1>
        <p className="section-copy md:text-lg">
          Local Background Remover is for independent makers who want speed, privacy, and ownership
          over their image workflow.
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
          If you handle sensitive images and ship often, this stack keeps costs predictable and
          workflows private.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/pricing">View pricing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Talk to cueva.io</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
