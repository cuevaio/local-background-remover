export type HomeHeroHeadlineVariant = "control" | "mac_app" | "product_photos";
export type HomePrimaryCtaVariant = "pricing_first" | "see_plans" | "buy_once";
export type HomeCliEmphasisVariant = "control" | "advanced_tool";
export type HomeBeforeAfterCopyVariant = "control" | "speed_examples" | "listing_outcomes" | "category_mix";
export type HomeInputOptionsCopyVariant = "control" | "import_flow" | "auto_cleanup" | "handoff_ready";
export type HomeWorkflowComparisonCopyVariant = "control" | "workflow_fit" | "role_based" | "speed_to_scale";
export type HomeCliQuickstartCopyVariant = "control" | "local_json" | "batch_ready" | "agent_terminal";
export type HomeAutomationChatsCopyVariant = "control" | "agent_handoff" | "repeat_batches" | "prompt_to_output";
export type HomeQuoteCopyVariant = "control" | "craft_handoff" | "private_pipeline" | "ship_cleaner";
export type HomeTestimonialsCopyVariant = "control" | "weekly_shippers" | "operator_proof" | "hybrid_teams";
export type HomePricingFaqCopyVariant = "control" | "buying_clarity" | "one_time_terms" | "plan_fit";
export type HomeFooterCopyVariant = "control" | "private_pay_once" | "mac_to_cli" | "one_purchase_stack";
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
  homeBeforeAfterCopy: HomeBeforeAfterCopyVariant;
  homeInputOptionsCopy: HomeInputOptionsCopyVariant;
  homeWorkflowComparisonCopy: HomeWorkflowComparisonCopyVariant;
  homeCliQuickstartCopy: HomeCliQuickstartCopyVariant;
  homeAutomationChatsCopy: HomeAutomationChatsCopyVariant;
  homeQuoteCopy: HomeQuoteCopyVariant;
  homeTestimonialsCopy: HomeTestimonialsCopyVariant;
  homePricingFaqCopy: HomePricingFaqCopyVariant;
  homeFooterCopy: HomeFooterCopyVariant;
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
  homeBeforeAfterCopy: "hba",
  homeInputOptionsCopy: "hio",
  homeWorkflowComparisonCopy: "hwc",
  homeCliQuickstartCopy: "hcq",
  homeAutomationChatsCopy: "hac",
  homeQuoteCopy: "hqc",
  homeTestimonialsCopy: "htm",
  homePricingFaqCopy: "hpf",
  homeFooterCopy: "hfc",
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
