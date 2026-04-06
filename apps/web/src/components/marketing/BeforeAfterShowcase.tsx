"use client";

import ExpLink from "@/components/experiments/ExpLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ExampleComparisonGrid from "@/components/marketing/ExampleComparisonGrid";
import { EXAMPLE_GALLERY } from "@/components/marketing/example-gallery";

type BeforeAfterShowcaseProps = {
  className?: string;
};

export default function BeforeAfterShowcase({ className }: BeforeAfterShowcaseProps) {
  const featuredExamples = EXAMPLE_GALLERY.slice(0, 3);

  return (
    <section className={cn("section-block flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-card">
          Before / after examples
        </Badge>
        <h2 className="section-title">
          See how quickly cluttered photos become clean product images
        </h2>
      </div>

      <ExampleComparisonGrid examples={featuredExamples} />

      <div>
        <Button asChild variant="outline">
          <ExpLink href="/gallery">See more examples</ExpLink>
        </Button>
      </div>
    </section>
  );
}
