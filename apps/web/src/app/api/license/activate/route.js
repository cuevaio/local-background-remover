import { NextResponse } from "next/server";

import { issueOfflineToken } from "@/lib/license-token";
import {
  activateLicenseKey,
  normalizeSurface,
  requireEnv,
  requiredBenefitForSurface,
  validateLicenseKey,
} from "@/lib/polar";

function activationErrorMessage(error) {
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

export async function POST(request) {
  try {
    const body = await request.json();
    const key = String(body?.key || "").trim();
    const surface = normalizeSurface(String(body?.surface || "cli").trim());
    const machineHash = String(body?.machine_hash || "").trim();

    if (!key || !machineHash) {
      return NextResponse.json(
        { ok: false, error: "key and machine_hash are required" },
        { status: 400 },
      );
    }

    if (surface !== "cli" && surface !== "desktop") {
      return NextResponse.json({ ok: false, error: "surface must be 'cli' or 'desktop'" }, { status: 400 });
    }

    const organizationId = requireEnv("POLAR_ORGANIZATION_ID");
    const requiredBenefitId = requiredBenefitForSurface(surface);
    const activation = await activateLicenseKey({
      key,
      organizationId,
      surface,
      machineHash,
    });

    const activationId = activation?.id;
    if (!activationId) {
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
      return NextResponse.json(
        { ok: false, error: "License key is not active" },
        { status: 403 },
      );
    }

    if (license.benefit_id !== requiredBenefitId) {
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

    return NextResponse.json({
      ok: true,
      activation_id: activationId,
      license_id: license.id,
      benefit_id: license.benefit_id,
      token: token.token,
      expires_at: token.expires_at,
      grace_expires_at: token.grace_expires_at,
      surfaces: token.payload.surfaces,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: activationErrorMessage(error) },
      { status: error.status || 500 },
    );
  }
}
