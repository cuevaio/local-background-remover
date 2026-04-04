"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import ExampleComparisonGrid from "@/components/marketing/ExampleComparisonGrid";
import { EXAMPLE_GALLERY } from "@/components/marketing/example-gallery";

export default function BeforeAfterShowcase() {
  const featuredExamples = EXAMPLE_GALLERY.slice(0, 3);

  return (
    <section className="section-block flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-card">
          Before / after examples
        </Badge>
        <h2 className="section-title">
          See how quickly messy backgrounds become ship-ready assets
        </h2>
      </div>

      <ExampleComparisonGrid examples={featuredExamples} />

      <div>
        <Button asChild variant="outline">
          <Link href="/gallery">See more examples</Link>
        </Button>
      </div>
    </section>
  );
}
