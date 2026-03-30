import { NextResponse } from "next/server";

import { polarFetch, productIdFromKind } from "@/lib/polar";

const ALLOWED_KINDS = new Set(["app", "cli", "both"]);

export async function POST(request) {
  try {
    const body = await request.json();
    const kind = body?.kind;

    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json(
        { ok: false, error: "kind must be one of: app, cli, both" },
        { status: 400 },
      );
    }

    const productId = productIdFromKind(kind);
    const successUrl = body?.successUrl || `${request.nextUrl.origin}/pricing?success=1`;

    const checkout = await polarFetch("/v1/checkouts/", {
      method: "POST",
      body: JSON.stringify({
        products: [productId],
        success_url: successUrl,
      }),
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to create checkout" },
      { status: 500 },
    );
  }
}
