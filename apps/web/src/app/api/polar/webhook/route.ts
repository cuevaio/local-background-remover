import { Webhooks } from "@polar-sh/nextjs";

import { env } from "@/env";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload: { type?: string }) => {
    const eventName = payload?.type || "unknown";
    console.log(`[polar-webhook] ${eventName}`);
  },
});
