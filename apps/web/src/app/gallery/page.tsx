import type { Metadata } from "next";
import { FlagValues } from "flags/react";

import ExperimentExposureTracker from "@/components/analytics/ExperimentExposureTracker";
import ExpLink from "@/components/experiments/ExpLink";
import ExampleComparisonGrid from "@/components/marketing/ExampleComparisonGrid";
import { EXAMPLE_GALLERY } from "@/components/marketing/example-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  evaluateGalleryAssignments,
  toFlagValues,
} from "@/lib/experiments/flags";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Background Remover Example Gallery",
  description:
    "See before-and-after product photos, portraits, and listing images cleaned up with Local Background Remover.",
  path: "/gallery",
});

const GALLERY_HERO_COPY: Record<string, { title: string; description: string }> = {
  control: {
    title: "See before-and-after examples across real image types",
    description:
      "Browse product photos, portraits, pets, packaging, and marketing images to see how Local Background Remover handles everyday cleanup work.",
  },
  product_photos: {
    title: "See product photos cleaned up for listings and marketing",
    description:
      "This gallery is especially useful if you sell products online and want cleaner listing images without upload-first tools.",
  },
};

export default async function GalleryPage() {
  const assignments = await evaluateGalleryAssignments();
  const heroCopy = GALLERY_HERO_COPY[assignments.galleryHeroIntent];
  return (
    <>
      <FlagValues values={toFlagValues(assignments)} />
      <ExperimentExposureTracker
        exposures={[
          {
            experimentKey: "gallery-hero-intent",
            variant: assignments.galleryHeroIntent,
            page: EXPERIMENT_PAGE.GALLERY,
            slot: "gallery.hero.copy",
          },
          {
            experimentKey: "sticky-cta-copy",
            variant: assignments.stickyCtaCopy,
            page: EXPERIMENT_PAGE.GALLERY,
            slot: "gallery.cta.row",
          },
        ]}
      />
      <main className="site-frame pb-28">
        <section className="section-block flex flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            Full gallery
          </Badge>
          <h1 className="display-title md:text-5xl">{heroCopy.title}</h1>
          <p className="section-copy md:text-lg">{heroCopy.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <ExpLink href="/pricing">See pricing</ExpLink>
            </Button>
            <Button asChild variant="outline">
              <ExpLink href="/downloads">Install anytime</ExpLink>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider flex flex-col gap-6">
          <ExampleComparisonGrid examples={EXAMPLE_GALLERY} />
        </section>
      </main>
    </>
  );
}
