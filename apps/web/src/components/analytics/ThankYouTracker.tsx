"use client";

import { useEffect } from "react";

import type { AnalyticsAttribution } from "@/lib/analytics/attribution";
import { GOOGLE_ADS_CONVERSION_LABEL, GOOGLE_ADS_ID } from "@/lib/analytics/google-ads";
import { trackCheckoutCompletedProxy } from "@/lib/analytics/events";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ThankYouTrackerProps = {
  kind: string;
  exp: string;
  checkoutId?: string;
  attribution: AnalyticsAttribution;
};

export default function ThankYouTracker({ kind, exp, checkoutId, attribution }: ThankYouTrackerProps) {
  useEffect(() => {
    trackCheckoutCompletedProxy({
      kind,
      page: EXPERIMENT_PAGE.THANK_YOU,
      exp,
      has_exp: Boolean(exp),
      checkout_id: checkoutId,
      ...attribution,
    });

    if (!GOOGLE_ADS_CONVERSION_LABEL || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      transaction_id: checkoutId,
    });
  }, [attribution, checkoutId, exp, kind]);

  return null;
}
