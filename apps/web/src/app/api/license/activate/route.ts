import { NextResponse } from "next/server";

import { env } from "@/env";
import { trackLicenseApiUsed } from "@/lib/analytics/events.server";
import { issueOfflineToken } from "@/lib/license-token";
import {
  activateLicenseKey,
  normalizeSurface,
  requiredBenefitForSurface,
  validateLicenseKey,
} from "@/lib/polar";

type LicenseBody = {
  key?: string;
  surface?: string;
  machine_hash?: string;
};

type ApiError = Error & { status?: number };

function toAnalyticsSurface(surface: string): "cli" | "desktop" | "unknown" {
  if (surface === "cli" || surface === "desktop") {
    return surface;
  }

  return "unknown";
}

function activationErrorMessage(error: ApiError) {
  const raw = String(error?.message || "Activation failed");
  const normalized = raw.toLowerCase();
  const isActivationLimit =
    (error?.status === 409 || error?.status === 422 || error?.status === 400) &&
    normalized.includes("activation") &&
    (normalized.includes("limit") ||
      normalized.includes("already") ||
      normalized.includes("maximum") ||
      normalized.includes("reached"));

  if (isActivationLimit) {
    return "This license key is already bound to another machine. It cannot be reused. Please use a different key.";
  }

  return raw;
}

export async function POST(request: Request) {
  let surface: "cli" | "desktop" | "unknown" = "unknown";

  try {
    const body = (await request.json()) as LicenseBody;
    const key = String(body?.key || "").trim();
    surface = toAnalyticsSurface(normalizeSurface(String(body?.surface || "cli").trim()));
    const machineHash = String(body?.machine_hash || "").trim();
    const publicKey = env.RMBG_LICENSE_PUBLIC_KEY;

    if (!key || !machineHash) {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 400,
        result: "missing_params",
        has_activation_id: false,
      });

      return NextResponse.json(
        { ok: false, error: "key and machine_hash are required" },
        { status: 400 },
      );
    }

    if (surface !== "cli" && surface !== "desktop") {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 400,
        result: "error",
        has_activation_id: false,
      });

      return NextResponse.json({ ok: false, error: "surface must be 'cli' or 'desktop'" }, { status: 400 });
    }

    const organizationId = env.POLAR_ORGANIZATION_ID;
    const requiredBenefitId = requiredBenefitForSurface(surface);

    const preflightLicense = await validateLicenseKey({
      key,
      organizationId,
      surface,
      machineHash,
    });

    if (!preflightLicense || preflightLicense.status !== "granted") {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 403,
        result: "inactive",
        has_activation_id: false,
      });

      return NextResponse.json(
        { ok: false, error: "License key is not active" },
        { status: 403 },
      );
    }

    if (preflightLicense.benefit_id !== requiredBenefitId) {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 403,
        result: "wrong_entitlement",
        has_activation_id: false,
      });

      return NextResponse.json(
        { ok: false, error: "License key does not include required entitlement" },
        { status: 403 },
      );
    }

    const activation = await activateLicenseKey({
      key,
      organizationId,
      surface,
      machineHash,
    });

    const activationId = activation?.id;
    if (!activationId) {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 502,
        result: "error",
        has_activation_id: false,
      });

      return NextResponse.json(
        { ok: false, error: "Polar did not return an activation ID" },
        { status: 502 },
      );
    }

    const license = await validateLicenseKey({
      key,
      organizationId,
      activationId,
      surface,
      machineHash,
    });

    if (!license || license.status !== "granted") {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 403,
        result: "inactive",
        has_activation_id: true,
      });

      return NextResponse.json(
        { ok: false, error: "License key is not active" },
        { status: 403 },
      );
    }

    if (license.benefit_id !== requiredBenefitId) {
      await trackLicenseApiUsed({
        action: "activate",
        surface,
        ok: false,
        status_code: 403,
        result: "wrong_entitlement",
        has_activation_id: true,
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
      action: "activate",
      surface,
      ok: true,
      status_code: 200,
      result: "granted",
      has_activation_id: true,
    });

    return NextResponse.json({
      ok: true,
      activation_id: activationId,
      license_id: license.id,
      benefit_id: license.benefit_id,
      public_key: publicKey,
      token: token.token,
      expires_at: token.expires_at,
      grace_expires_at: token.grace_expires_at,
      surfaces: token.payload.surfaces,
    });
  } catch (error: unknown) {
    const wrappedError = error as ApiError;
    await trackLicenseApiUsed({
      action: "activate",
      surface,
      ok: false,
      status_code: wrappedError.status || 500,
      result: "error",
      has_activation_id: false,
    });

    return NextResponse.json(
      { ok: false, error: activationErrorMessage(wrappedError) },
      { status: wrappedError.status || 500 },
    );
  }
}
