"use client";

import ExpLink from "@/components/experiments/ExpLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ExampleComparisonGrid from "@/components/marketing/ExampleComparisonGrid";
import { EXAMPLE_GALLERY } from "@/components/marketing/example-gallery";
import type { HomePageCopy } from "@/content/home/heading-copy";

type BeforeAfterShowcaseProps = {
  className?: string;
  copy: HomePageCopy["beforeAfter"];
};

export default function BeforeAfterShowcase({ className, copy }: BeforeAfterShowcaseProps) {
  const featuredExamples = EXAMPLE_GALLERY.slice(0, 3).map((example, index) => ({
    ...example,
    title: copy.examples[index]?.title ?? example.title,
    context: copy.examples[index]?.context ?? example.context,
  }));

  return (
    <section className={cn("section-block flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-card">
          {copy.badge}
        </Badge>
        <h2 className="section-title">{copy.title}</h2>
      </div>

      <ExampleComparisonGrid examples={featuredExamples} />

      <div>
        <Button asChild variant="outline">
          <ExpLink href="/gallery">{copy.ctaLabel}</ExpLink>
        </Button>
      </div>
    </section>
  );
}
