export type HomeHeroHeadlineVariant = "control" | "mac_app" | "product_photos";
export type HomePrimaryCtaVariant = "pricing_first" | "see_plans" | "buy_once";
export type HomeCliEmphasisVariant = "control" | "advanced_tool";
export type PricingHeroCopyVariant = "control" | "one_time_mac" | "app_first";
export type PricingPlanCtaVariant = "control" | "get_access" | "unlock";
export type PricingPlanFramingVariant = "control" | "buyer_labels";
export type StickyCtaCopyVariant = "control" | "plans_first" | "pricing_docs";
export type DownloadsHeroCopyVariant = "control" | "support_page";
export type ComparePrimaryCtaVariant = "control" | "pricing_first";
export type DocsHeroFramingVariant = "control" | "agents_and_batches";
export type GalleryHeroIntentVariant = "control" | "product_photos";

export type ExperimentAssignments = {
  homeHeroHeadline: HomeHeroHeadlineVariant;
  homePrimaryCta: HomePrimaryCtaVariant;
  homeCliEmphasis: HomeCliEmphasisVariant;
  pricingHeroCopy: PricingHeroCopyVariant;
  pricingPlanCta: PricingPlanCtaVariant;
  pricingPlanFraming: PricingPlanFramingVariant;
  stickyCtaCopy: StickyCtaCopyVariant;
  downloadsHeroCopy: DownloadsHeroCopyVariant;
  comparePrimaryCta: ComparePrimaryCtaVariant;
  docsHeroFraming: DocsHeroFramingVariant;
  galleryHeroIntent: GalleryHeroIntentVariant;
};

export type ExperimentAssignmentKey = keyof ExperimentAssignments;

export const EXPERIMENT_TOKEN_KEYS: Record<ExperimentAssignmentKey, string> = {
  homeHeroHeadline: "hhh",
  homePrimaryCta: "hpc",
  homeCliEmphasis: "hce",
  pricingHeroCopy: "phc",
  pricingPlanCta: "ppc",
  pricingPlanFraming: "ppf",
  stickyCtaCopy: "scc",
  downloadsHeroCopy: "dhc",
  comparePrimaryCta: "cpc",
  docsHeroFraming: "dhf",
  galleryHeroIntent: "ghi",
};

export const EXPERIMENT_PAGE = {
  HOME: "home",
  PRICING: "pricing",
  DOWNLOADS: "downloads",
  DOCS: "docs",
  COMPARE: "compare",
  GALLERY: "gallery",
  THANK_YOU: "thank_you",
} as const;

export type ExperimentPage = (typeof EXPERIMENT_PAGE)[keyof typeof EXPERIMENT_PAGE];
