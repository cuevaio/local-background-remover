import { NextResponse } from "next/server";

import {
  normalizeSurface,
  requireEnv,
  requiredBenefitForSurface,
  validateLicenseKey,
} from "@/lib/polar";

export async function POST(request) {
  try {
    const body = await request.json();
    const key = String(body?.key || "").trim();
    const surface = normalizeSurface(String(body?.surface || "cli").trim());
    const machineHash = String(body?.machine_hash || "").trim();
    const activationId = String(body?.activation_id || "").trim();

    if (!key) {
      return NextResponse.json({ ok: false, error: "key is required" }, { status: 400 });
    }

    if (surface !== "cli" && surface !== "desktop") {
      return NextResponse.json({ ok: false, error: "surface must be 'cli' or 'desktop'" }, { status: 400 });
    }

    const organizationId = requireEnv("POLAR_ORGANIZATION_ID");
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
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Validation failed" },
      { status: error.status || 500 },
    );
  }
}
