import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { trackCheckoutFailed, trackCheckoutStarted } from "@/lib/analytics/events.server";
import { readAttributionFromRequest, toAnalyticsAttribution, toPolarMetadata, withExperiment } from "@/lib/analytics/attribution";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";
import { polarFetch, productIdFromKind } from "@/lib/polar";

const ALLOWED_KINDS = new Set(["app", "cli", "both"] as const);

type CheckoutRequestBody = {
  kind?: "app" | "cli" | "both";
  successUrl?: string;
  exp?: string;
};

type CheckoutResponse = {
  id?: string;
  url?: string;
  total_amount?: number;
  currency?: string;
};

export async function POST(request: NextRequest) {
  let kind: CheckoutRequestBody["kind"];
  let exp = "";
  let attribution = readAttributionFromRequest(request);

  try {
    const body = (await request.json()) as CheckoutRequestBody;
    kind = body?.kind;
    exp = typeof body?.exp === "string" ? body.exp : "";
    attribution = withExperiment(attribution, exp);
    const analyticsAttribution = toAnalyticsAttribution(attribution);

    if (!kind || !ALLOWED_KINDS.has(kind)) {
      await trackCheckoutFailed({
        page: EXPERIMENT_PAGE.PRICING,
        exp,
        has_exp: Boolean(exp),
        reason: "invalid_kind",
        ...analyticsAttribution,
      });

      return NextResponse.json(
        { ok: false, error: "kind must be one of: app, cli, both" },
        { status: 400 },
      );
    }

    const productId = productIdFromKind(kind);
    const requestUrl = new URL(request.url);
    const successUrl = new URL(body?.successUrl || "/thank-you", requestUrl.origin);
    successUrl.searchParams.set("checkout_id", "{CHECKOUT_ID}");
    successUrl.searchParams.set("kind", kind);
    if (exp) {
      successUrl.searchParams.set("exp", exp);
    }

    const checkout = (await polarFetch("/v1/checkouts/", {
      method: "POST",
      body: JSON.stringify({
        products: [productId],
        success_url: successUrl.toString(),
        metadata: toPolarMetadata(attribution, kind),
      }),
    })) as CheckoutResponse;

    await trackCheckoutStarted({
      kind,
      page: EXPERIMENT_PAGE.PRICING,
      exp,
      has_exp: Boolean(exp),
      ...analyticsAttribution,
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error: unknown) {
    await trackCheckoutFailed({
      kind,
      page: EXPERIMENT_PAGE.PRICING,
      exp,
      has_exp: Boolean(exp),
      reason: typeof error === "object" && error && "status" in error ? "polar_error" : "unknown",
      ...toAnalyticsAttribution(attribution),
    });

    const message = error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
