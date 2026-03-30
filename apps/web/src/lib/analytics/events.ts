import { track } from "@vercel/analytics";

import type { ExperimentPage } from "@/lib/experiments/types";

export const EVENT_EXPERIMENT_EXPOSURE = "experiment_exposure";
export const EVENT_CHECKOUT_STARTED = "checkout_started";
export const EVENT_CHECKOUT_COMPLETED_PROXY = "checkout_completed_proxy";

export type ExperimentExposureEvent = {
  experiment_key: string;
  variant: string;
  page: ExperimentPage;
  slot: string;
};

export type CheckoutStartedEvent = {
  kind: "app" | "cli" | "both";
  page: ExperimentPage;
  exp: string;
};

export type CheckoutCompletedProxyEvent = {
  kind: string;
  page: ExperimentPage;
  exp: string;
  has_exp: boolean;
};

export function trackExperimentExposure(event: ExperimentExposureEvent): void {
  track(EVENT_EXPERIMENT_EXPOSURE, event);
}

export function trackCheckoutStarted(event: CheckoutStartedEvent): void {
  track(EVENT_CHECKOUT_STARTED, event);
}

export function trackCheckoutCompletedProxy(event: CheckoutCompletedProxyEvent): void {
  track(EVENT_CHECKOUT_COMPLETED_PROXY, event);
}
