import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";

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
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const kind = body?.kind;
    const exp = typeof body?.exp === "string" ? body.exp : "";

    if (!kind || !ALLOWED_KINDS.has(kind)) {
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

    await track("checkout_started", {
      kind,
      page: "pricing",
      exp,
      has_exp: Boolean(exp),
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
