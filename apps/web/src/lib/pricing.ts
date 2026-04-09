export type PlanKind = "app" | "cli" | "both";

export type PricingPlan = {
  kind: PlanKind;
  title: string;
  currentPriceUsd: string;
  regularPriceUsd: string;
  access: string;
  bullets: string[];
  featured?: boolean;
};

export const PRICING_PROMO = {
  discountLabel: "50% off",
  endsAtLocal: "2026-04-15T23:59:59",
  endsLabel: "April 15",
} as const;

export const PRICING_PLANS: PricingPlan[] = [
  {
    kind: "app",
    title: "App",
    currentPriceUsd: "9.99",
    regularPriceUsd: "19.99",
    access: "Desktop access",
    bullets: [
      "Desktop visual workflow",
      "Before/after compare controls",
      "Quick setup in the app",
    ],
  },
  {
    kind: "cli",
    title: "CLI",
    currentPriceUsd: "9.99",
    regularPriceUsd: "19.99",
    access: "Command-line access",
    bullets: [
      "Batch processing in terminal",
      "Great for repeat workflows",
      "Quick setup in command line",
    ],
  },
  {
    kind: "both",
    title: "App + CLI",
    currentPriceUsd: "14.99",
    regularPriceUsd: "29.99",
    access: "Desktop + command-line access",
    featured: true,
    bullets: [
      "Desktop + terminal workflows",
      "Best value for frequent shippers",
      "Best for mixed visual + batch workflows",
    ],
  },
];

export function formatUsd(amountUsd: string) {
  return `$${amountUsd}`;
}

export function getPricingRange() {
  const values = PRICING_PLANS.map((plan) => Number(plan.currentPriceUsd)).sort((a, b) => a - b);
  const first = values[0];
  const last = values[values.length - 1];

  return {
    lowPriceUsd: first.toFixed(2),
    highPriceUsd: last.toFixed(2),
  };
}
