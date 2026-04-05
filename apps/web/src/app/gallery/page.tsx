import type { Metadata } from "next";

import ExpLink from "@/components/experiments/ExpLink";
import ExampleComparisonGrid from "@/components/marketing/ExampleComparisonGrid";
import { EXAMPLE_GALLERY } from "@/components/marketing/example-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Example Gallery",
  description:
    "Browse every before-and-after example for Local Background Remover, from product photos to portraits and pets.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Full gallery
        </Badge>
        <h1 className="display-title md:text-5xl">All before-and-after examples</h1>
        <p className="section-copy md:text-lg">
          Browse the full set of examples across products, portraits, pets, packaging, and creative
          assets. Each card keeps the same draggable slider used on the homepage.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <ExpLink href="/downloads">Download free installer</ExpLink>
          </Button>
          <Button asChild variant="outline">
            <ExpLink href="/pricing">See pricing</ExpLink>
          </Button>
        </div>
      </section>

      <section className="section-block section-divider flex flex-col gap-6">
        <ExampleComparisonGrid examples={EXAMPLE_GALLERY} />
      </section>
    </main>
  );
}
