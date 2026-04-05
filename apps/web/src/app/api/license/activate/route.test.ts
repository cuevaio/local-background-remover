import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

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

type LicenseRecord = {
  id: string;
  status: string;
  benefit_id: string;
  expires_at?: string | null;
  usage?: unknown;
  limit_usage?: unknown;
};

const polarCalls = {
  validate: [] as Array<{ key: string; activationId?: string; surface?: string; machineHash?: string }>,
  activate: [] as Array<{ key: string; organizationId: string; surface: string; machineHash: string }>,
};

let preflightLicense: LicenseRecord | null = null;
let activatedLicense: LicenseRecord | null = null;
let activationResponse: { id?: string } | null = { id: "activation_1" };
let activationError: Error | null = null;

mock.module("@/lib/polar", () => ({
  activateLicenseKey: async (input: {
    key: string;
    organizationId: string;
    surface: string;
    machineHash: string;
  }) => {
    polarCalls.activate.push(input);
    if (activationError) {
      throw activationError;
    }
    return activationResponse;
  },
  normalizeSurface: (surface: string) => {
    if (surface === "app") {
      return "desktop";
    }
    if (surface === "desktop" || surface === "cli") {
      return surface;
    }
    return "cli";
  },
  requiredBenefitForSurface: (surface: string) => {
    if (surface === "desktop") {
      return "benefit_desktop";
    }
    return "benefit_cli";
  },
  validateLicenseKey: async (input: {
    key: string;
    organizationId: string;
    activationId?: string;
    surface?: string;
    machineHash?: string;
  }) => {
    polarCalls.validate.push(input);
    return input.activationId ? activatedLicense : preflightLicense;
  },
}));

mock.module("@/lib/license-token", () => ({
  issueOfflineToken: () => ({
    token: "offline-token",
    expires_at: 123,
    grace_expires_at: 456,
    payload: { surfaces: ["cli"] },
  }),
}));

const { POST } = await import("./route");

function resetState() {
  polarCalls.validate = [];
  polarCalls.activate = [];
  preflightLicense = null;
  activatedLicense = null;
  activationResponse = { id: "activation_1" };
  activationError = null;
}

function buildRequest(body: Record<string, unknown>) {
  return new Request("https://example.com/api/license/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetState();
});

afterEach(() => {
  resetState();
});

describe("POST /api/license/activate", () => {
  test("rejects wrong-surface keys before activation", async () => {
    preflightLicense = {
      id: "license_1",
      status: "granted",
      benefit_id: "benefit_desktop",
      expires_at: null,
    };

    const response = await POST(
      buildRequest({
        key: "APP-123",
        surface: "cli",
        machine_hash: "machine-1",
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      ok: false,
      error: "License key does not include required entitlement",
    });
    expect(polarCalls.validate).toHaveLength(1);
    expect(polarCalls.activate).toHaveLength(0);
  });

  test("rejects non-granted keys before activation", async () => {
    preflightLicense = {
      id: "license_1",
      status: "revoked",
      benefit_id: "benefit_cli",
      expires_at: null,
    };

    const response = await POST(
      buildRequest({
        key: "CLI-123",
        surface: "cli",
        machine_hash: "machine-1",
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "License key is not active" });
    expect(polarCalls.validate).toHaveLength(1);
    expect(polarCalls.activate).toHaveLength(0);
  });

  test("activates valid keys and issues an offline token", async () => {
    preflightLicense = {
      id: "license_1",
      status: "granted",
      benefit_id: "benefit_cli",
      expires_at: null,
    };
    activatedLicense = {
      id: "license_1",
      status: "granted",
      benefit_id: "benefit_cli",
      expires_at: null,
    };

    const response = await POST(
      buildRequest({
        key: "CLI-123",
        surface: "cli",
        machine_hash: "machine-1",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      activation_id: "activation_1",
      license_id: "license_1",
      benefit_id: "benefit_cli",
      public_key: "public_key_test",
      token: "offline-token",
      expires_at: 123,
      grace_expires_at: 456,
      surfaces: ["cli"],
    });
    expect(polarCalls.validate).toHaveLength(2);
    expect(polarCalls.activate).toHaveLength(1);
  });

  test("maps activation-limit errors when activation is reached", async () => {
    preflightLicense = {
      id: "license_1",
      status: "granted",
      benefit_id: "benefit_cli",
      expires_at: null,
    };
    activationError = new Error("Activation limit already reached") as Error & {
      status?: number;
    };
    (activationError as Error & { status?: number }).status = 409;

    const response = await POST(
      buildRequest({
        key: "CLI-123",
        surface: "cli",
        machine_hash: "machine-1",
      }),
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      ok: false,
      error: "This license key is already bound to another machine. It cannot be reused. Please use a different key.",
    });
    expect(polarCalls.validate).toHaveLength(1);
    expect(polarCalls.activate).toHaveLength(1);
  });
});
