import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    const eventName = payload?.type || "unknown";
    console.log(`[polar-webhook] ${eventName}`);
  },
});
