"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRICING_PLANS, PRICING_PROMO, formatUsd } from "@/lib/pricing";

type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const PROMO_ENDS_AT = new Date(PRICING_PROMO.endsAtLocal).getTime();

function getCountdownParts(): CountdownParts | null {
  const diff = PROMO_ENDS_AT - Date.now();

  if (diff <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

const appPlan = PRICING_PLANS.find((plan) => plan.kind === "app");
const bundlePlan = PRICING_PLANS.find((plan) => plan.kind === "both");

export default function PromotionCountdown() {
  const [countdown, setCountdown] = useState<CountdownParts | null | undefined>(undefined);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownParts());
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <Card className="border-black/10 bg-secondary/40">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit bg-black text-white hover:bg-black">{PRICING_PROMO.discountLabel}</Badge>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">Sale pricing ends {PRICING_PROMO.endsLabel}.</p>
            <p className="text-sm text-muted-foreground">
              Use code {PRICING_PROMO.code}. App or CLI {formatUsd(appPlan?.currentPriceUsd || "9.99")} each, App + CLI{" "}
              {formatUsd(bundlePlan?.currentPriceUsd || "14.99")}. Regular prices return to{" "}
              {formatUsd(appPlan?.regularPriceUsd || "19.99")} and {formatUsd(bundlePlan?.regularPriceUsd || "29.99")}.
            </p>
          </div>
        </div>

        {countdown ? (
          <div className="grid grid-cols-4 gap-2 sm:min-w-[18rem]">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Min", value: countdown.minutes },
              { label: "Sec", value: countdown.seconds },
            ].map((part) => (
              <div key={part.label} className="rounded-lg border border-border bg-background px-3 py-2 text-center">
                <div className="font-display text-2xl font-medium tracking-tight text-foreground">{part.value}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{part.label}</div>
              </div>
            ))}
          </div>
        ) : countdown === null ? (
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
            Offer ended {PRICING_PROMO.endsLabel}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
            Offer ends {PRICING_PROMO.endsLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
