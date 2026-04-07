import { track } from "@vercel/analytics";

import type { AnalyticsAttribution } from "@/lib/analytics/attribution";
import type { ExperimentPage } from "@/lib/experiments/types";

export type AnalyticsPlanKind = "app" | "cli" | "both";
export type AnalyticsSurface = "cli" | "desktop" | "unknown";

export const EVENT_CTA_CLICKED = "cta_clicked";
export const EVENT_COMMAND_COPIED = "command_copied";
export const EVENT_EXPERIMENT_EXPOSURE = "experiment_exposure";
export const EVENT_CHECKOUT_STARTED = "checkout_started";
export const EVENT_CHECKOUT_FAILED = "checkout_failed";
export const EVENT_CHECKOUT_COMPLETED_PROXY = "checkout_completed_proxy";
export const EVENT_LICENSE_API_USED = "license_api_used";
export const EVENT_PURCHASE_COMPLETED = "purchase_completed";

export type CtaClickedEvent = {
  slot: string;
  label: string;
  href: string;
  page_path: string;
  exp: string;
  has_exp: boolean;
  kind?: AnalyticsPlanKind;
};

export type CommandCopiedEvent = {
  command_id: string;
  page_path: string;
  exp: string;
  has_exp: boolean;
};

export type ExperimentExposureEvent = {
  experiment_key: string;
  variant: string;
  page: ExperimentPage;
  slot: string;
};

export type CheckoutStartedEvent = AnalyticsAttribution & {
  kind: AnalyticsPlanKind;
  page: ExperimentPage;
  exp: string;
  has_exp: boolean;
};

export type CheckoutFailedEvent = AnalyticsAttribution & {
  kind?: AnalyticsPlanKind;
  page: ExperimentPage;
  exp: string;
  has_exp: boolean;
  reason: "invalid_kind" | "polar_error" | "unknown";
};

export type CheckoutCompletedProxyEvent = AnalyticsAttribution & {
  kind: string;
  page: ExperimentPage;
  exp: string;
  has_exp: boolean;
  checkout_id?: string;
};

export type PurchaseCompletedEvent = AnalyticsAttribution & {
  kind?: string;
  exp: string;
  has_exp: boolean;
  order_id?: string;
  checkout_id?: string;
  product_id?: string;
  amount?: number;
  currency?: string;
};

export type LicenseApiUsedEvent = {
  action: "activate" | "refresh" | "validate";
  surface: AnalyticsSurface;
  ok: boolean;
  status_code: number;
  result: "granted" | "inactive" | "missing_params" | "wrong_entitlement" | "error";
  has_activation_id: boolean;
};

export function trackCtaClicked(event: CtaClickedEvent): void {
  track(EVENT_CTA_CLICKED, event);
}

export function trackCommandCopied(event: CommandCopiedEvent): void {
  track(EVENT_COMMAND_COPIED, event);
}

export function trackExperimentExposure(event: ExperimentExposureEvent): void {
  track(EVENT_EXPERIMENT_EXPOSURE, event);
}

export function trackCheckoutCompletedProxy(event: CheckoutCompletedProxyEvent): void {
  track(EVENT_CHECKOUT_COMPLETED_PROXY, event);
}

export function trackPurchaseCompleted(event: PurchaseCompletedEvent): void {
  track(EVENT_PURCHASE_COMPLETED, event);
}
