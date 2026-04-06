import { NextResponse } from "next/server";

import { env } from "@/env";
import { trackLicenseApiUsed } from "@/lib/analytics/events.server";
import {
  normalizeSurface,
  requiredBenefitForSurface,
  validateLicenseKey,
} from "@/lib/polar";

type LicenseBody = {
  key?: string;
  surface?: string;
  machine_hash?: string;
  activation_id?: string;
};

type ApiError = Error & { status?: number };

function toAnalyticsSurface(surface: string): "cli" | "desktop" | "unknown" {
  if (surface === "cli" || surface === "desktop") {
    return surface;
  }

  return "unknown";
}

export async function POST(request: Request) {
  let surface: "cli" | "desktop" | "unknown" = "unknown";
  let hasActivationId = false;

  try {
    const body = (await request.json()) as LicenseBody;
    const key = String(body?.key || "").trim();
    surface = toAnalyticsSurface(normalizeSurface(String(body?.surface || "cli").trim()));
    const machineHash = String(body?.machine_hash || "").trim();
    const activationId = String(body?.activation_id || "").trim();
    hasActivationId = Boolean(activationId);

    if (!key) {
      await trackLicenseApiUsed({
        action: "validate",
        surface,
        ok: false,
        status_code: 400,
        result: "missing_params",
        has_activation_id: hasActivationId,
      });

      return NextResponse.json({ ok: false, error: "key is required" }, { status: 400 });
    }

    if (surface !== "cli" && surface !== "desktop") {
      await trackLicenseApiUsed({
        action: "validate",
        surface,
        ok: false,
        status_code: 400,
        result: "error",
        has_activation_id: hasActivationId,
      });

      return NextResponse.json({ ok: false, error: "surface must be 'cli' or 'desktop'" }, { status: 400 });
    }

    const organizationId = env.POLAR_ORGANIZATION_ID;
    const requiredBenefitId = requiredBenefitForSurface(surface);
    const license = await validateLicenseKey({
      key,
      organizationId,
      activationId: activationId || undefined,
      surface,
      machineHash: machineHash || undefined,
    });

    const isGranted = license?.status === "granted";
    const hasBenefit = license?.benefit_id === requiredBenefitId;

    await trackLicenseApiUsed({
      action: "validate",
      surface,
      ok: Boolean(isGranted && hasBenefit),
      status_code: 200,
      result: isGranted ? (hasBenefit ? "granted" : "wrong_entitlement") : "inactive",
      has_activation_id: hasActivationId,
    });

    return NextResponse.json({
      ok: true,
      active: Boolean(isGranted && hasBenefit),
      status: license?.status || "unknown",
      benefit_id: license?.benefit_id || null,
      required_benefit_id: requiredBenefitId,
      surface,
      activation_id: activationId || null,
      license_id: license?.id || null,
      expires_at: license?.expires_at || null,
      usage: license?.usage ?? null,
      limit_usage: license?.limit_usage ?? null,
    });
  } catch (error: unknown) {
    const wrappedError = error as ApiError;
    await trackLicenseApiUsed({
      action: "validate",
      surface,
      ok: false,
      status_code: wrappedError.status || 500,
      result: "error",
      has_activation_id: hasActivationId,
    });

    return NextResponse.json(
      { ok: false, error: wrappedError.message || "Validation failed" },
      { status: wrappedError.status || 500 },
    );
  }
}
