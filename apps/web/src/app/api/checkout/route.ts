import { NextResponse } from "next/server";

import { trackCheckoutFailed, trackCheckoutStarted } from "@/lib/analytics/events.server";
import { EXPERIMENT_PAGE } from "@/lib/experiments/types";
import { polarFetch, productIdFromKind } from "@/lib/polar";

const ALLOWED_KINDS = new Set(["app", "cli", "both"] as const);

type CheckoutRequestBody = {
  kind?: "app" | "cli" | "both";
  successUrl?: string;
  exp?: string;
};

type CheckoutResponse = {
  url?: string;
};

export async function POST(request: Request) {
  let kind: CheckoutRequestBody["kind"];
  let exp = "";

  try {
    const body = (await request.json()) as CheckoutRequestBody;
    kind = body?.kind;
    exp = typeof body?.exp === "string" ? body.exp : "";

    if (!kind || !ALLOWED_KINDS.has(kind)) {
      await trackCheckoutFailed({
        page: EXPERIMENT_PAGE.PRICING,
        exp,
        has_exp: Boolean(exp),
        reason: "invalid_kind",
      });

      return NextResponse.json(
        { ok: false, error: "kind must be one of: app, cli, both" },
        { status: 400 },
      );
    }

    const productId = productIdFromKind(kind);
    const requestUrl = new URL(request.url);
    const successUrl = new URL(body?.successUrl || "/thank-you", requestUrl.origin);
    successUrl.searchParams.set("kind", kind);
    if (exp) {
      successUrl.searchParams.set("exp", exp);
    }

    const checkout = (await polarFetch("/v1/checkouts/", {
      method: "POST",
      body: JSON.stringify({
        products: [productId],
        success_url: successUrl.toString(),
      }),
    })) as CheckoutResponse;

    await trackCheckoutStarted({
      kind,
      page: EXPERIMENT_PAGE.PRICING,
      exp,
      has_exp: Boolean(exp),
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error: unknown) {
    await trackCheckoutFailed({
      kind,
      page: EXPERIMENT_PAGE.PRICING,
      exp,
      has_exp: Boolean(exp),
      reason: typeof error === "object" && error && "status" in error ? "polar_error" : "unknown",
    });

    const message = error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
