import { track } from "@vercel/analytics/server";

import {
  EVENT_CHECKOUT_FAILED,
  EVENT_CHECKOUT_STARTED,
  EVENT_LICENSE_API_USED,
  EVENT_PURCHASE_COMPLETED,
  type CheckoutFailedEvent,
  type CheckoutStartedEvent,
  type LicenseApiUsedEvent,
  type PurchaseCompletedEvent,
} from "@/lib/analytics/events";

type ServerTrackPayload = Parameters<typeof track>[1];

async function safeTrack(eventName: string, payload: ServerTrackPayload) {
  try {
    await track(eventName, payload);
  } catch {
    // Analytics failures should not affect user-facing flows.
  }
}

export async function trackCheckoutStarted(event: CheckoutStartedEvent): Promise<void> {
  await safeTrack(EVENT_CHECKOUT_STARTED, event);
}

export async function trackCheckoutFailed(event: CheckoutFailedEvent): Promise<void> {
  await safeTrack(EVENT_CHECKOUT_FAILED, event);
}

export async function trackLicenseApiUsed(event: LicenseApiUsedEvent): Promise<void> {
  await safeTrack(EVENT_LICENSE_API_USED, event);
}

export async function trackPurchaseCompleted(event: PurchaseCompletedEvent): Promise<void> {
  await safeTrack(EVENT_PURCHASE_COMPLETED, event);
}
