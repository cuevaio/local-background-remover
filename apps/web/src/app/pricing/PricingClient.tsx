"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trackCtaClicked } from "@/lib/analytics/events";
import type { PricingPlanCtaVariant } from "@/lib/experiments/types";
import { PRICING_PLANS, PRICING_PROMO, type PlanKind, formatUsd } from "@/lib/pricing";

type PricingClientProps = {
  ctaVariant: PricingPlanCtaVariant;
  exp: string;
};

type CheckoutResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
};

const CTA_VARIANTS: Record<PricingPlanCtaVariant, Record<PlanKind, string>> = {
  control: {
    app: "Buy App License",
    cli: "Buy CLI License",
    both: "Buy App + CLI Bundle",
  },
  get_access: {
    app: "Get App Access",
    cli: "Get CLI Access",
    both: "Get Full Bundle",
  },
  unlock: {
    app: "Unlock App",
    cli: "Unlock CLI",
    both: "Unlock Everything",
  },
};

export default function PricingClient({ ctaVariant, exp }: PricingClientProps) {
  const [busyKind, setBusyKind] = useState<PlanKind | null>(null);
  const [message, setMessage] = useState("");

  const ctaMap = CTA_VARIANTS[ctaVariant];

  const plans = PRICING_PLANS.map((plan) => ({
    ...plan,
    cta: ctaMap[plan.kind],
  }));

  async function startCheckout(kind: PlanKind) {
    const selectedPlan = plans.find((plan) => plan.kind === kind);
    trackCtaClicked({
      slot: `pricing.plan.${kind}`,
      label: selectedPlan?.cta ?? "Open checkout",
      kind,
      href: "/api/checkout",
      page_path: window.location.pathname,
      exp,
      has_exp: Boolean(exp),
    });

    setBusyKind(kind);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, exp }),
      });

      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      const messageText = error instanceof Error ? error.message : "Checkout failed";
      setMessage(messageText);
      setBusyKind(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.kind}
            className={plan.featured ? "border-black" : ""}
          >
            <CardHeader>
              {plan.featured ? <Badge className="w-fit">Best value</Badge> : null}
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.access}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-end gap-3">
                <p className="font-display text-4xl font-medium tracking-tight">
                  {formatUsd(plan.currentPriceUsd)}
                </p>
                <p className="pb-1 text-base text-muted-foreground line-through">
                  {formatUsd(plan.regularPriceUsd)}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {PRICING_PROMO.discountLabel} through {PRICING_PROMO.endsLabel}
              </p>
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                {plan.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="bg-secondary/45">
              <Button
                className="w-full"
                onClick={() => startCheckout(plan.kind)}
                disabled={busyKind === plan.kind}
                type="button"
              >
                {busyKind === plan.kind ? "Opening checkout..." : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle>Workflow comparison</CardTitle>
          <CardDescription>Quick plan matrix for App, CLI, and Bundle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>App</TableHead>
                <TableHead>CLI</TableHead>
                <TableHead>App + CLI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sale price</TableCell>
                <TableCell>{formatUsd(PRICING_PLANS[0].currentPriceUsd)}</TableCell>
                <TableCell>{formatUsd(PRICING_PLANS[1].currentPriceUsd)}</TableCell>
                <TableCell>{formatUsd(PRICING_PLANS[2].currentPriceUsd)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Regular price</TableCell>
                <TableCell>{formatUsd(PRICING_PLANS[0].regularPriceUsd)}</TableCell>
                <TableCell>{formatUsd(PRICING_PLANS[1].regularPriceUsd)}</TableCell>
                <TableCell>{formatUsd(PRICING_PLANS[2].regularPriceUsd)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Access included</TableCell>
                <TableCell>Desktop</TableCell>
                <TableCell>Command line</TableCell>
                <TableCell>Desktop + command line</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Desktop processing</TableCell>
                <TableCell>Yes (App workflow)</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Yes (bundle workflow)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Automation pipeline</TableCell>
                <TableCell>Limited</TableCell>
                <TableCell>Strong</TableCell>
                <TableCell>Strong</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
