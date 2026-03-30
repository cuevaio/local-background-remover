import { vercelAdapter } from "@flags-sdk/vercel";
import { flag, type Flag } from "flags/next";
import type { Adapter } from "flags";

import type {
  DownloadsHeroCopyVariant,
  ExperimentAssignments,
  HomeHeroHeadlineVariant,
  HomePrimaryCtaVariant,
  PricingHeroCopyVariant,
  PricingPlanCtaVariant,
  StickyCtaCopyVariant,
} from "@/lib/experiments/types";

// When FLAGS env is present (Vercel deployment) the vercelAdapter handles bucketing.
// Without it (local dev) the `decide` fallback always returns "control".
function getAdapter<V, E = any>(): Adapter<V, E> | undefined {
  if (!process.env.FLAGS) return undefined;
  return vercelAdapter<V, E>();
}

export const homeHeroHeadlineFlag: Flag<HomeHeroHeadlineVariant> = flag<HomeHeroHeadlineVariant>({
  key: "home-hero-headline",
  adapter: getAdapter<HomeHeroHeadlineVariant>(),
  description: "Homepage hero headline copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "outcome", label: "Outcome" },
    { value: "privacy", label: "Privacy" },
  ],
  decide: () => "control",
});

export const homePrimaryCtaFlag: Flag<HomePrimaryCtaVariant> = flag<HomePrimaryCtaVariant>({
  key: "home-primary-cta",
  adapter: getAdapter<HomePrimaryCtaVariant>(),
  description: "Homepage primary CTA label variant",
  options: [
    { value: "control", label: "Control" },
    { value: "download_free", label: "Download Free" },
    { value: "start_downloads", label: "Start Downloads" },
  ],
  decide: () => "control",
});

export const pricingHeroCopyFlag: Flag<PricingHeroCopyVariant> = flag<PricingHeroCopyVariant>({
  key: "pricing-hero-copy",
  adapter: getAdapter<PricingHeroCopyVariant>(),
  description: "Pricing hero title and subtitle variant",
  options: [
    { value: "control", label: "Control" },
    { value: "one_payment", label: "One Payment" },
    { value: "upgrade_later", label: "Upgrade Later" },
  ],
  decide: () => "control",
});

export const pricingPlanCtaFlag: Flag<PricingPlanCtaVariant> = flag<PricingPlanCtaVariant>({
  key: "pricing-plan-cta",
  adapter: getAdapter<PricingPlanCtaVariant>(),
  description: "Pricing plan card CTA copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "get_access", label: "Get Access" },
    { value: "unlock", label: "Unlock" },
  ],
  decide: () => "control",
});

export const stickyCtaCopyFlag: Flag<StickyCtaCopyVariant> = flag<StickyCtaCopyVariant>({
  key: "sticky-cta-copy",
  adapter: getAdapter<StickyCtaCopyVariant>(),
  description: "Sticky CTA labels variant",
  options: [
    { value: "control", label: "Control" },
    { value: "compare_install", label: "Compare/Install" },
    { value: "buy_get", label: "Buy/Get" },
  ],
  decide: () => "control",
});

export const downloadsHeroCopyFlag: Flag<DownloadsHeroCopyVariant> = flag<DownloadsHeroCopyVariant>({
  key: "downloads-hero-copy",
  adapter: getAdapter<DownloadsHeroCopyVariant>(),
  description: "Downloads hero copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "install_minutes", label: "Install Minutes" },
    { value: "download_then_buy", label: "Download Then Buy" },
  ],
  decide: () => "control",
});

export const flagDefinitions = {
  homeHeroHeadlineFlag,
  homePrimaryCtaFlag,
  pricingHeroCopyFlag,
  pricingPlanCtaFlag,
  stickyCtaCopyFlag,
  downloadsHeroCopyFlag,
};

export async function evaluateHomeAssignments(): Promise<
  Pick<ExperimentAssignments, "homeHeroHeadline" | "homePrimaryCta" | "stickyCtaCopy">
> {
  const [homeHeroHeadline, homePrimaryCta, stickyCtaCopy] = await Promise.all([
    homeHeroHeadlineFlag(),
    homePrimaryCtaFlag(),
    stickyCtaCopyFlag(),
  ]);

  return { homeHeroHeadline, homePrimaryCta, stickyCtaCopy };
}

export async function evaluatePricingAssignments(): Promise<
  Pick<ExperimentAssignments, "pricingHeroCopy" | "pricingPlanCta" | "stickyCtaCopy">
> {
  const [pricingHeroCopy, pricingPlanCta, stickyCtaCopy] = await Promise.all([
    pricingHeroCopyFlag(),
    pricingPlanCtaFlag(),
    stickyCtaCopyFlag(),
  ]);

  return { pricingHeroCopy, pricingPlanCta, stickyCtaCopy };
}

export async function evaluateDownloadsAssignments(): Promise<
  Pick<ExperimentAssignments, "downloadsHeroCopy" | "stickyCtaCopy">
> {
  const [downloadsHeroCopy, stickyCtaCopy] = await Promise.all([
    downloadsHeroCopyFlag(),
    stickyCtaCopyFlag(),
  ]);

  return { downloadsHeroCopy, stickyCtaCopy };
}

export function toFlagValues(assignments: Partial<ExperimentAssignments>): Record<string, string> {
  const values: Record<string, string> = {};

  if (assignments.homeHeroHeadline) {
    values["home-hero-headline"] = assignments.homeHeroHeadline;
  }

  if (assignments.homePrimaryCta) {
    values["home-primary-cta"] = assignments.homePrimaryCta;
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

  return values;
}
