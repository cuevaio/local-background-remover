import type { Metadata } from "next";

import ExpLink from "@/components/experiments/ExpLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

const PRINCIPLES = [
  {
    title: "Private by default",
    description:
      "Background removal runs locally so creators can process sensitive assets without sending files to a third-party API.",
  },
  {
    title: "Simple one-time pricing",
    description:
      "No usage meters or credits. Buy once, activate your key, and use the workflow when you need it.",
  },
  {
    title: "Indie and hands-on",
    description:
      "I ship this product directly, read customer feedback myself, and keep every release focused on practical wins.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "Learn about cueva.io and why Local Background Remover is built as an indie, local-first product.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Indie software by cueva.io
        </Badge>
        <h1 className="display-title md:text-5xl">Product built by cueva.io.</h1>
        <p className="section-copy md:text-lg">
          Hi, I am Anthony. I build Local Background Remover as an independent product for people
          who want fast background cleanup without giving up privacy. Every part of this product is
          shaped to stay practical: simple setup, one-time pricing, and local processing you can
          trust.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <ExpLink href="/downloads">Open downloads</ExpLink>
          </Button>
          <Button asChild variant="outline">
            <ExpLink href="/contact">Contact cueva.io</ExpLink>
          </Button>
        </div>
      </section>

      <section className="section-block section-divider grid gap-4 md:grid-cols-3">
        {PRINCIPLES.map((item) => (
          <Card key={item.title} className="bg-card/95">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="section-block section-divider flex flex-col gap-4 md:max-w-3xl">
        <h2 className="section-title text-3xl md:text-4xl">Why this exists</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          I wanted a background remover that feels dependable for real delivery work: local, quick to
          install, and predictable to run in both desktop and terminal flows. That is the baseline I
          continue to build against.
        </p>
        <p className="text-sm text-muted-foreground md:text-base">
          Thanks for supporting indie software. Your purchases and feedback directly fund product
          improvements and long-term maintenance.
        </p>
      </section>
    </main>
  );
}
