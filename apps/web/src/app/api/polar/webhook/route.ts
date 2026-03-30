import { Webhooks } from "@polar-sh/nextjs";

import { requireEnv } from "@/lib/polar";

export const POST = Webhooks({
  webhookSecret: requireEnv("POLAR_WEBHOOK_SECRET"),
  onPayload: async (payload: { type?: string }) => {
    const eventName = payload?.type || "unknown";
    console.log(`[polar-webhook] ${eventName}`);
  },
});
