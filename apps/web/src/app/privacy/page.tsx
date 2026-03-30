import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

const PRIVACY_BLOCKS = [
  {
    title: "What this product needs",
    body: "Purchase and license metadata is used to issue and validate keys for desktop and CLI usage.",
  },
  {
    title: "What this product does not need",
    body: "Your images do not need to be uploaded for local background removal workflows.",
  },
  {
    title: "How processing works",
    body: "Inference runs from local model files on your machine after activation, so day-to-day processing can stay offline.",
  },
  {
    title: "Support and policy updates",
    body: "If privacy practices are updated, this page is updated and reflected with the latest publish date.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy",
  description:
    "Plain-language privacy overview for Local Background Remover and its local-first processing model.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Privacy overview
        </Badge>
        <h1 className="display-title md:text-5xl">Privacy, in plain language</h1>
        <p className="section-copy md:text-lg">
          Local Background Remover is designed so independent builders can keep image workflows
          private and controlled. This page summarizes how the product handles data in practical
          terms.
        </p>
      </section>

      <section className="section-block section-divider grid gap-4 md:grid-cols-2">
        {PRIVACY_BLOCKS.map((item) => (
          <Card key={item.title} className="bg-card/95">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="section-block section-divider flex flex-col gap-4 md:max-w-3xl">
        <p className="text-sm text-muted-foreground md:text-base">
          This page is an operational summary and does not replace legal advice for your specific
          business needs.
        </p>
        <p className="text-sm text-muted-foreground md:text-base">
          Legal owner and rights holder: Anthony Cueva.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/contact">Privacy questions</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
