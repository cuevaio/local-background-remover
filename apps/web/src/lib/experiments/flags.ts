import { vercelAdapter } from "@flags-sdk/vercel";
import type { Adapter } from "flags";
import { dedupe, flag, type Flag } from "flags/next";

import { getFlagsEnv } from "@/env";
import type {
  ComparePrimaryCtaVariant,
  DocsHeroFramingVariant,
  DownloadsHeroCopyVariant,
  ExperimentAssignments,
  GalleryHeroIntentVariant,
  HomeAutomationChatsCopyVariant,
  HomeBeforeAfterCopyVariant,
  HomeCliQuickstartCopyVariant,
  HomeFooterCopyVariant,
  HomeHeroHeadlineVariant,
  HomeInputOptionsCopyVariant,
  HomePrimaryCtaVariant,
  HomePricingFaqCopyVariant,
  HomeQuoteCopyVariant,
  HomeTestimonialsCopyVariant,
  HomeWorkflowComparisonCopyVariant,
  PricingHeroCopyVariant,
  PricingPlanCtaVariant,
  StickyCtaCopyVariant,
} from "@/lib/experiments/types";

type FlagEntities = {
  user?: {
    id: string;
  };
};

const VISITOR_ID_COOKIE = "rmbg_visitor_id";

let hasValidatedFlagsEnv = false;

function ensureFlagsEnv() {
  if (hasValidatedFlagsEnv) {
    return;
  }

  try {
    getFlagsEnv();
  } catch {
    throw new Error(
      "Vercel Flags requires FLAGS and FLAGS_SECRET. Run `vercel env pull .env.local --yes` locally and ensure both env vars are configured in Vercel.",
    );
  }

  hasValidatedFlagsEnv = true;
}

function getAdapter<V, E = any>(): Adapter<V, E> {
  ensureFlagsEnv();
  return vercelAdapter<V, E>();
}

const identify = dedupe(async ({ cookies }: { cookies: { get(name: string): { value: string } | undefined } }) => {
  const visitorId = cookies.get(VISITOR_ID_COOKIE)?.value;

  if (!visitorId) {
    return {} satisfies FlagEntities;
  }

  return {
    user: {
      id: visitorId,
    },
  } satisfies FlagEntities;
});

export const homeHeroHeadlineFlag: Flag<HomeHeroHeadlineVariant, FlagEntities> = flag<HomeHeroHeadlineVariant, FlagEntities>({
  key: "home-hero-headline",
  adapter: getAdapter<HomeHeroHeadlineVariant>(),
  identify,
  description: "Homepage hero headline copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "mac_app", label: "Mac App" },
    { value: "product_photos", label: "Product Photos" },
  ],
});

export const homePrimaryCtaFlag: Flag<HomePrimaryCtaVariant, FlagEntities> = flag<HomePrimaryCtaVariant, FlagEntities>({
  key: "home-primary-cta",
  adapter: getAdapter<HomePrimaryCtaVariant>(),
  identify,
  description: "Homepage primary CTA label variant",
  options: [
    { value: "pricing_first", label: "Pricing First" },
    { value: "see_plans", label: "See Plans" },
    { value: "buy_once", label: "Buy Once" },
  ],
});

export const homeBeforeAfterCopyFlag: Flag<HomeBeforeAfterCopyVariant, FlagEntities> = flag<HomeBeforeAfterCopyVariant, FlagEntities>({
  key: "home-before-after-copy",
  adapter: getAdapter<HomeBeforeAfterCopyVariant>(),
  identify,
  description: "Homepage before and after section heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "speed_examples", label: "Speed Examples" },
    { value: "listing_outcomes", label: "Listing Outcomes" },
  ],
});

export const homeInputOptionsCopyFlag: Flag<HomeInputOptionsCopyVariant, FlagEntities> = flag<HomeInputOptionsCopyVariant, FlagEntities>({
  key: "home-input-options-copy",
  adapter: getAdapter<HomeInputOptionsCopyVariant>(),
  identify,
  description: "Homepage input options heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "import_flow", label: "Import Flow" },
    { value: "handoff_ready", label: "Handoff Ready" },
  ],
});

export const homeWorkflowComparisonCopyFlag: Flag<HomeWorkflowComparisonCopyVariant, FlagEntities> = flag<HomeWorkflowComparisonCopyVariant, FlagEntities>({
  key: "home-workflow-comparison-copy",
  adapter: getAdapter<HomeWorkflowComparisonCopyVariant>(),
  identify,
  description: "Homepage workflow comparison heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "workflow_fit", label: "Workflow Fit" },
    { value: "role_based", label: "Role Based" },
  ],
});

export const homeCliQuickstartCopyFlag: Flag<HomeCliQuickstartCopyVariant, FlagEntities> = flag<HomeCliQuickstartCopyVariant, FlagEntities>({
  key: "home-cli-quickstart-copy",
  adapter: getAdapter<HomeCliQuickstartCopyVariant>(),
  identify,
  description: "Homepage CLI quickstart heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "local_json", label: "Local JSON" },
    { value: "agent_terminal", label: "Agent Terminal" },
  ],
});

export const homeAutomationChatsCopyFlag: Flag<HomeAutomationChatsCopyVariant, FlagEntities> = flag<HomeAutomationChatsCopyVariant, FlagEntities>({
  key: "home-automation-chats-copy",
  adapter: getAdapter<HomeAutomationChatsCopyVariant>(),
  identify,
  description: "Homepage automation chats heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "agent_handoff", label: "Agent Handoff" },
    { value: "repeat_batches", label: "Repeat Batches" },
  ],
});

export const homeQuoteCopyFlag: Flag<HomeQuoteCopyVariant, FlagEntities> = flag<HomeQuoteCopyVariant, FlagEntities>({
  key: "home-quote-copy",
  adapter: getAdapter<HomeQuoteCopyVariant>(),
  identify,
  description: "Homepage quote section heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "craft_handoff", label: "Craft Handoff" },
    { value: "private_pipeline", label: "Private Pipeline" },
  ],
});

export const homeTestimonialsCopyFlag: Flag<HomeTestimonialsCopyVariant, FlagEntities> = flag<HomeTestimonialsCopyVariant, FlagEntities>({
  key: "home-testimonials-copy",
  adapter: getAdapter<HomeTestimonialsCopyVariant>(),
  identify,
  description: "Homepage testimonials heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "weekly_shippers", label: "Weekly Shippers" },
    { value: "hybrid_teams", label: "Hybrid Teams" },
  ],
});

export const homePricingFaqCopyFlag: Flag<HomePricingFaqCopyVariant, FlagEntities> = flag<HomePricingFaqCopyVariant, FlagEntities>({
  key: "home-pricing-faq-copy",
  adapter: getAdapter<HomePricingFaqCopyVariant>(),
  identify,
  description: "Homepage pricing faq heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "buying_clarity", label: "Buying Clarity" },
    { value: "plan_fit", label: "Plan Fit" },
  ],
});

export const homeFooterCopyFlag: Flag<HomeFooterCopyVariant, FlagEntities> = flag<HomeFooterCopyVariant, FlagEntities>({
  key: "home-footer-copy",
  adapter: getAdapter<HomeFooterCopyVariant>(),
  identify,
  description: "Homepage footer heading bundle",
  options: [
    { value: "control", label: "Control" },
    { value: "private_pay_once", label: "Private Pay Once" },
    { value: "mac_to_cli", label: "Mac To CLI" },
  ],
});

export const pricingHeroCopyFlag: Flag<PricingHeroCopyVariant, FlagEntities> = flag<PricingHeroCopyVariant, FlagEntities>({
  key: "pricing-hero-copy",
  adapter: getAdapter<PricingHeroCopyVariant>(),
  identify,
  description: "Pricing hero title and subtitle variant",
  options: [
    { value: "control", label: "Control" },
    { value: "one_time_mac", label: "One Time Mac" },
    { value: "app_first", label: "App First" },
  ],
});

export const pricingPlanCtaFlag: Flag<PricingPlanCtaVariant, FlagEntities> = flag<PricingPlanCtaVariant, FlagEntities>({
  key: "pricing-plan-cta",
  adapter: getAdapter<PricingPlanCtaVariant>(),
  identify,
  description: "Pricing plan card CTA copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "get_access", label: "Get Access" },
    { value: "unlock", label: "Unlock" },
  ],
});

export const stickyCtaCopyFlag: Flag<StickyCtaCopyVariant, FlagEntities> = flag<StickyCtaCopyVariant, FlagEntities>({
  key: "sticky-cta-copy",
  adapter: getAdapter<StickyCtaCopyVariant>(),
  identify,
  description: "Sticky CTA labels variant",
  options: [
    { value: "control", label: "Control" },
    { value: "plans_first", label: "Plans First" },
    { value: "pricing_docs", label: "Pricing/Docs" },
  ],
});

export const downloadsHeroCopyFlag: Flag<DownloadsHeroCopyVariant, FlagEntities> = flag<DownloadsHeroCopyVariant, FlagEntities>({
  key: "downloads-hero-copy",
  adapter: getAdapter<DownloadsHeroCopyVariant>(),
  identify,
  description: "Downloads hero copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "support_page", label: "Support Page" },
  ],
});

export const comparePrimaryCtaFlag: Flag<ComparePrimaryCtaVariant, FlagEntities> = flag<ComparePrimaryCtaVariant, FlagEntities>({
  key: "compare-primary-cta",
  adapter: getAdapter<ComparePrimaryCtaVariant>(),
  identify,
  description: "Compare page primary CTA variant",
  options: [
    { value: "control", label: "Control" },
    { value: "pricing_first", label: "Pricing First" },
  ],
});

export const docsHeroFramingFlag: Flag<DocsHeroFramingVariant, FlagEntities> = flag<DocsHeroFramingVariant, FlagEntities>({
  key: "docs-hero-framing",
  adapter: getAdapter<DocsHeroFramingVariant>(),
  identify,
  description: "Docs hero framing variant",
  options: [
    { value: "control", label: "Control" },
    { value: "agents_and_batches", label: "Agents And Batches" },
  ],
});

export const galleryHeroIntentFlag: Flag<GalleryHeroIntentVariant, FlagEntities> = flag<GalleryHeroIntentVariant, FlagEntities>({
  key: "gallery-hero-intent",
  adapter: getAdapter<GalleryHeroIntentVariant>(),
  identify,
  description: "Gallery hero intent variant",
  options: [
    { value: "control", label: "Control" },
    { value: "product_photos", label: "Product Photos" },
  ],
});

export const flagDefinitions = {
  homeHeroHeadlineFlag,
  homePrimaryCtaFlag,
  homeBeforeAfterCopyFlag,
  homeInputOptionsCopyFlag,
  homeWorkflowComparisonCopyFlag,
  homeCliQuickstartCopyFlag,
  homeAutomationChatsCopyFlag,
  homeQuoteCopyFlag,
  homeTestimonialsCopyFlag,
  homePricingFaqCopyFlag,
  homeFooterCopyFlag,
  pricingHeroCopyFlag,
  pricingPlanCtaFlag,
  stickyCtaCopyFlag,
  downloadsHeroCopyFlag,
  comparePrimaryCtaFlag,
  docsHeroFramingFlag,
  galleryHeroIntentFlag,
};

export async function evaluateHomeAssignments(): Promise<
  Pick<
    ExperimentAssignments,
    | "homeHeroHeadline"
    | "homePrimaryCta"
    | "homeBeforeAfterCopy"
    | "homeInputOptionsCopy"
    | "homeWorkflowComparisonCopy"
    | "homeCliQuickstartCopy"
    | "homeAutomationChatsCopy"
    | "homeQuoteCopy"
    | "homeTestimonialsCopy"
    | "homePricingFaqCopy"
    | "homeFooterCopy"
    | "stickyCtaCopy"
  >
> {
  const homeHeroHeadline = await homeHeroHeadlineFlag();

  return {
    homeHeroHeadline,
    homePrimaryCta: "pricing_first",
    homeBeforeAfterCopy: "control",
    homeInputOptionsCopy: "control",
    homeWorkflowComparisonCopy: "control",
    homeCliQuickstartCopy: "control",
    homeAutomationChatsCopy: "control",
    homeQuoteCopy: "control",
    homeTestimonialsCopy: "control",
    homePricingFaqCopy: "control",
    homeFooterCopy: "control",
    stickyCtaCopy: "control",
  };
}

export async function evaluatePricingAssignments(): Promise<
  Pick<ExperimentAssignments, "pricingHeroCopy" | "pricingPlanCta" | "stickyCtaCopy">
> {
  const pricingHeroCopy = await pricingHeroCopyFlag();

  return {
    pricingHeroCopy,
    pricingPlanCta: "control",
    stickyCtaCopy: "control",
  };
}

export async function evaluateDownloadsAssignments(): Promise<
  Pick<ExperimentAssignments, "downloadsHeroCopy" | "stickyCtaCopy">
> {
  return { downloadsHeroCopy: "control", stickyCtaCopy: "control" };
}

export async function evaluateDocsAssignments(): Promise<Pick<ExperimentAssignments, "docsHeroFraming" | "stickyCtaCopy">> {
  return { docsHeroFraming: "control", stickyCtaCopy: "control" };
}

export async function evaluateCompareAssignments(): Promise<Pick<ExperimentAssignments, "comparePrimaryCta" | "stickyCtaCopy">> {
  return { comparePrimaryCta: "control", stickyCtaCopy: "control" };
}

export async function evaluateGalleryAssignments(): Promise<Pick<ExperimentAssignments, "galleryHeroIntent" | "stickyCtaCopy">> {
  return { galleryHeroIntent: "control", stickyCtaCopy: "control" };
}

export function toFlagValues(assignments: Partial<ExperimentAssignments>): Record<string, string> {
  const values: Record<string, string> = {};

  if (assignments.homeHeroHeadline) {
    values["home-hero-headline"] = assignments.homeHeroHeadline;
  }

  if (assignments.homePrimaryCta) {
    values["home-primary-cta"] = assignments.homePrimaryCta;
  }

  if (assignments.homeBeforeAfterCopy) {
    values["home-before-after-copy"] = assignments.homeBeforeAfterCopy;
  }

  if (assignments.homeInputOptionsCopy) {
    values["home-input-options-copy"] = assignments.homeInputOptionsCopy;
  }

  if (assignments.homeWorkflowComparisonCopy) {
    values["home-workflow-comparison-copy"] = assignments.homeWorkflowComparisonCopy;
  }

  if (assignments.homeCliQuickstartCopy) {
    values["home-cli-quickstart-copy"] = assignments.homeCliQuickstartCopy;
  }

  if (assignments.homeAutomationChatsCopy) {
    values["home-automation-chats-copy"] = assignments.homeAutomationChatsCopy;
  }

  if (assignments.homeQuoteCopy) {
    values["home-quote-copy"] = assignments.homeQuoteCopy;
  }

  if (assignments.homeTestimonialsCopy) {
    values["home-testimonials-copy"] = assignments.homeTestimonialsCopy;
  }

  if (assignments.homePricingFaqCopy) {
    values["home-pricing-faq-copy"] = assignments.homePricingFaqCopy;
  }

  if (assignments.homeFooterCopy) {
    values["home-footer-copy"] = assignments.homeFooterCopy;
  }

  if (assignments.pricingHeroCopy) {
    values["pricing-hero-copy"] = assignments.pricingHeroCopy;
  }

  if (assignments.pricingPlanCta) {
    values["pricing-plan-cta"] = assignments.pricingPlanCta;
  }

  if (assignments.stickyCtaCopy) {
    values["sticky-cta-copy"] = assignments.stickyCtaCopy;
  }

  if (assignments.downloadsHeroCopy) {
    values["downloads-hero-copy"] = assignments.downloadsHeroCopy;
  }

  if (assignments.comparePrimaryCta) {
    values["compare-primary-cta"] = assignments.comparePrimaryCta;
  }

  if (assignments.docsHeroFraming) {
    values["docs-hero-framing"] = assignments.docsHeroFraming;
  }

  if (assignments.galleryHeroIntent) {
    values["gallery-hero-intent"] = assignments.galleryHeroIntent;
  }

  return values;
}
