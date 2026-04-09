import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";

process.env.POLAR_SERVER = "sandbox";
process.env.POLAR_ACCESS_TOKEN = "polar_oat_test";
process.env.POLAR_ORGANIZATION_ID = "org_test";
process.env.POLAR_WEBHOOK_SECRET = "whsec_test";
process.env.POLAR_PRODUCT_APP_ID = "prod_app";
process.env.POLAR_PRODUCT_CLI_ID = "prod_cli";
process.env.POLAR_PRODUCT_BOTH_ID = "prod_both";
process.env.POLAR_BENEFIT_CLI_ID = "benefit_cli";
process.env.POLAR_BENEFIT_DESKTOP_ID = "benefit_desktop";
process.env.LICENSE_SIGNING_PRIVATE_KEY = "private_key_test";
process.env.RMBG_LICENSE_PUBLIC_KEY = "public_key_test";

const analyticsCalls = {
  started: [] as Array<Record<string, unknown>>,
  failed: [] as Array<Record<string, unknown>>,
};

const polarCalls = {
  create: [] as Array<Record<string, unknown>>,
};

mock.module("@/lib/analytics/events.server", () => ({
  trackCheckoutStarted: async (event: Record<string, unknown>) => {
    analyticsCalls.started.push(event);
  },
  trackCheckoutFailed: async (event: Record<string, unknown>) => {
    analyticsCalls.failed.push(event);
  },
  trackLicenseApiUsed: async () => {},
  trackPurchaseCompleted: async () => {},
}));

mock.module("@/lib/polar", () => ({
  activateLicenseKey: async () => ({ id: "activation_1" }),
  findDiscountIdByCode: async (code: string) => (code === "LAUNCH50" ? "discount_launch50" : null),
  normalizeSurface: (surface: string) => surface,
  productIdFromKind: (kind: string) => `product_${kind}`,
  polarFetch: async (_path: string, options: RequestInit) => {
    polarCalls.create.push(JSON.parse(String(options.body)) as Record<string, unknown>);
    return {
      id: "checkout_123",
      url: "https://sandbox-checkout.polar.sh/session/checkout_123",
      total_amount: 999,
      currency: "USD",
    };
  },
  requiredBenefitForSurface: () => "benefit_cli",
  validateLicenseKey: async () => ({ id: "license_1", status: "granted", benefit_id: "benefit_cli" }),
}));

const { POST } = await import("./route");

function buildRequest(body: Record<string, unknown>, cookie?: string) {
  return new NextRequest("https://local.backgroundrm.com/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  analyticsCalls.started = [];
  analyticsCalls.failed = [];
  polarCalls.create = [];
});

describe("POST /api/checkout", () => {
  test("forwards attribution metadata into Polar checkout and analytics", async () => {
    const attributionCookie = encodeURIComponent(
      JSON.stringify({
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "launch",
        gclid: "click-123",
        exp: "hhh:mac_app",
        landing_path: "/",
        referrer_host: "www.google.com",
      }),
    );

    const response = await POST(
      buildRequest(
        {
          kind: "both",
          exp: "hhh:product_photos~phc:one_time_mac",
        },
        `rmbg_attribution=${attributionCookie}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(polarCalls.create).toHaveLength(1);
    expect(polarCalls.create[0]).toMatchObject({
      products: ["product_both"],
      discount_id: "discount_launch50",
      allow_discount_codes: true,
      metadata: {
        kind: "both",
        attr_usrc: "google",
        attr_umed: "cpc",
        attr_ucmp: "launch",
        attr_gclid: "click-123",
        attr_exp: "hhh:product_photos~phc:one_time_mac",
      },
    });
    expect(String(polarCalls.create[0].success_url)).toContain("kind=both");
    expect(String(polarCalls.create[0].success_url)).toContain("checkout_id=%7BCHECKOUT_ID%7D");
    expect(analyticsCalls.started).toHaveLength(1);
    expect(analyticsCalls.started[0]).toMatchObject({
      kind: "both",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "launch",
      has_gclid: true,
      exp: "hhh:product_photos~phc:one_time_mac",
      has_exp: true,
    });
  });

  test("tracks invalid checkout kinds with attribution context", async () => {
    const attributionCookie = encodeURIComponent(JSON.stringify({ utm_source: "google", gclid: "click-123" }));
    const response = await POST(
      buildRequest(
        { kind: "invalid", exp: "hhh:mac_app" },
        `rmbg_attribution=${attributionCookie}`,
      ),
    );

    expect(response.status).toBe(400);
    expect(analyticsCalls.failed).toHaveLength(1);
    expect(analyticsCalls.failed[0]).toMatchObject({
      reason: "invalid_kind",
      utm_source: "google",
      has_gclid: true,
      exp: "hhh:mac_app",
      has_exp: true,
    });
  });
});
