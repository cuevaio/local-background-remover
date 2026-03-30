"use client";

import { useEffect } from "react";

import { trackCheckoutCompletedProxy } from "@/lib/analytics/events";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";

type ThankYouTrackerProps = {
  kind: string;
  exp: string;
};

export default function ThankYouTracker({ kind, exp }: ThankYouTrackerProps) {
  useEffect(() => {
    trackCheckoutCompletedProxy({
      kind,
      page: EXPERIMENT_PAGE.THANK_YOU,
      exp,
      has_exp: Boolean(exp),
    });
  }, [kind, exp]);

  return null;
}
