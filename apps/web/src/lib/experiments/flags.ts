import { vercelAdapter } from "@flags-sdk/vercel";
import type { Adapter } from "flags";
import { dedupe, flag, type Flag } from "flags/next";

import { getFlagsEnv } from "@/env";
import type {
  DownloadsHeroCopyVariant,
  ExperimentAssignments,
  HomeHeroHeadlineVariant,
  HomePrimaryCtaVariant,
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
    { value: "outcome", label: "Outcome" },
    { value: "privacy", label: "Privacy" },
  ],
});

export const homePrimaryCtaFlag: Flag<HomePrimaryCtaVariant, FlagEntities> = flag<HomePrimaryCtaVariant, FlagEntities>({
  key: "home-primary-cta",
  adapter: getAdapter<HomePrimaryCtaVariant>(),
  identify,
  description: "Homepage primary CTA label variant",
  options: [
    { value: "control", label: "Control" },
    { value: "download_free", label: "Download Free" },
    { value: "start_downloads", label: "Start Downloads" },
  ],
});

export const pricingHeroCopyFlag: Flag<PricingHeroCopyVariant, FlagEntities> = flag<PricingHeroCopyVariant, FlagEntities>({
  key: "pricing-hero-copy",
  adapter: getAdapter<PricingHeroCopyVariant>(),
  identify,
  description: "Pricing hero title and subtitle variant",
  options: [
    { value: "control", label: "Control" },
    { value: "one_payment", label: "One Payment" },
    { value: "upgrade_later", label: "Upgrade Later" },
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
    { value: "compare_install", label: "Compare/Install" },
    { value: "buy_get", label: "Buy/Get" },
  ],
});

export const downloadsHeroCopyFlag: Flag<DownloadsHeroCopyVariant, FlagEntities> = flag<DownloadsHeroCopyVariant, FlagEntities>({
  key: "downloads-hero-copy",
  adapter: getAdapter<DownloadsHeroCopyVariant>(),
  identify,
  description: "Downloads hero copy variant",
  options: [
    { value: "control", label: "Control" },
    { value: "install_minutes", label: "Install Minutes" },
    { value: "download_then_buy", label: "Download Then Buy" },
  ],
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
