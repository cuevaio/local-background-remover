export type HomeHeroHeadlineVariant = "control" | "outcome" | "privacy";
export type HomePrimaryCtaVariant = "control" | "download_free" | "start_downloads";
export type PricingHeroCopyVariant = "control" | "one_payment" | "upgrade_later";
export type PricingPlanCtaVariant = "control" | "get_access" | "unlock";
export type StickyCtaCopyVariant = "control" | "compare_install" | "buy_get";
export type DownloadsHeroCopyVariant = "control" | "install_minutes" | "download_then_buy";

export type ExperimentAssignments = {
  homeHeroHeadline: HomeHeroHeadlineVariant;
  homePrimaryCta: HomePrimaryCtaVariant;
  pricingHeroCopy: PricingHeroCopyVariant;
  pricingPlanCta: PricingPlanCtaVariant;
  stickyCtaCopy: StickyCtaCopyVariant;
  downloadsHeroCopy: DownloadsHeroCopyVariant;
};

export type ExperimentAssignmentKey = keyof ExperimentAssignments;

export const EXPERIMENT_TOKEN_KEYS: Record<ExperimentAssignmentKey, string> = {
  homeHeroHeadline: "hhh",
  homePrimaryCta: "hpc",
  pricingHeroCopy: "phc",
  pricingPlanCta: "ppc",
  stickyCtaCopy: "scc",
  downloadsHeroCopy: "dhc",
};

export const EXPERIMENT_PAGE = {
  HOME: "home",
  PRICING: "pricing",
  DOWNLOADS: "downloads",
  THANK_YOU: "thank_you",
} as const;

export type ExperimentPage = (typeof EXPERIMENT_PAGE)[keyof typeof EXPERIMENT_PAGE];
