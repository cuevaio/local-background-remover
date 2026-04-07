import { Webhooks } from "@polar-sh/nextjs";

import { env } from "@/env";
import { trackPurchaseCompleted } from "@/lib/analytics/events.server";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(record: Record<string, unknown> | null, key: string): number | undefined {
  const value = record?.[key];
  return typeof value === "number" ? value : undefined;
}

function metadataAttribution(metadata: Record<string, unknown> | null) {
  return {
    utm_source: readString(metadata, "attr_usrc"),
    utm_medium: readString(metadata, "attr_umed"),
    utm_campaign: readString(metadata, "attr_ucmp"),
    utm_content: readString(metadata, "attr_ucon"),
    utm_term: readString(metadata, "attr_utrm"),
    landing_path: readString(metadata, "attr_lp"),
    referrer_host: readString(metadata, "attr_ref"),
    has_gclid: Boolean(readString(metadata, "attr_gclid")),
    has_gbraid: Boolean(readString(metadata, "attr_gbraid")),
    has_wbraid: Boolean(readString(metadata, "attr_wbraid")),
  };
}

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload: { type?: string } & Record<string, unknown>) => {
    const eventName = payload?.type || "unknown";

    if (eventName === "order.paid") {
      const eventData = asRecord(payload.data) || asRecord(payload);
      const metadata = asRecord(eventData?.metadata);
      const product = asRecord(eventData?.product);

      await trackPurchaseCompleted({
        kind: readString(metadata, "kind"),
        exp: readString(metadata, "attr_exp") || "",
        has_exp: Boolean(readString(metadata, "attr_exp")),
        order_id: readString(eventData, "id"),
        checkout_id: readString(eventData, "checkout_id"),
        product_id: readString(eventData, "product_id") || readString(product, "id"),
        amount: readNumber(eventData, "amount") ?? readNumber(eventData, "total_amount"),
        currency: readString(eventData, "currency"),
        ...metadataAttribution(metadata),
      });
    }

    console.log(`[polar-webhook] ${eventName}`);
  },
});
