import { NextResponse } from "next/server";

import { env } from "@/env";
import { trackLicenseApiUsed } from "@/lib/analytics/events.server";
import { issueOfflineToken } from "@/lib/license-token";
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
    const publicKey = env.RMBG_LICENSE_PUBLIC_KEY;

    if (!key || !machineHash || !activationId) {
      await trackLicenseApiUsed({
        action: "refresh",
        surface,
        ok: false,
        status_code: 400,
        result: "missing_params",
        has_activation_id: hasActivationId,
      });

      return NextResponse.json(
        { ok: false, error: "key, machine_hash, and activation_id are required" },
        { status: 400 },
      );
    }

    if (surface !== "cli" && surface !== "desktop") {
      await trackLicenseApiUsed({
        action: "refresh",
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
      activationId,
      surface,
      machineHash,
    });

    if (!license || license.status !== "granted") {
      await trackLicenseApiUsed({
        action: "refresh",
        surface,
        ok: false,
        status_code: 403,
        result: "inactive",
        has_activation_id: hasActivationId,
      });

      return NextResponse.json(
        { ok: false, error: "License key is not active" },
        { status: 403 },
      );
    }

    if (license.benefit_id !== requiredBenefitId) {
      await trackLicenseApiUsed({
        action: "refresh",
        surface,
        ok: false,
        status_code: 403,
        result: "wrong_entitlement",
        has_activation_id: hasActivationId,
      });

      return NextResponse.json(
        { ok: false, error: "License key does not include required entitlement" },
        { status: 403 },
      );
    }

    const token = issueOfflineToken({
      license,
      key,
      surface,
      machineHash,
      activationId,
    });

    await trackLicenseApiUsed({
      action: "refresh",
      surface,
      ok: true,
      status_code: 200,
      result: "granted",
      has_activation_id: hasActivationId,
    });

    return NextResponse.json({
      ok: true,
      activation_id: activationId,
      public_key: publicKey,
      token: token.token,
      expires_at: token.expires_at,
      grace_expires_at: token.grace_expires_at,
      surfaces: token.payload.surfaces,
    });
  } catch (error: unknown) {
    const wrappedError = error as ApiError;
    await trackLicenseApiUsed({
      action: "refresh",
      surface,
      ok: false,
      status_code: wrappedError.status || 500,
      result: "error",
      has_activation_id: hasActivationId,
    });

    return NextResponse.json(
      { ok: false, error: wrappedError.message || "Refresh failed" },
      { status: wrappedError.status || 500 },
    );
  }
}
