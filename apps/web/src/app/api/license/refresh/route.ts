import { NextResponse } from "next/server";

import { env } from "@/env";
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LicenseBody;
    const key = String(body?.key || "").trim();
    const surface = normalizeSurface(String(body?.surface || "cli").trim());
    const machineHash = String(body?.machine_hash || "").trim();
    const activationId = String(body?.activation_id || "").trim();
    const publicKey = env.RMBG_LICENSE_PUBLIC_KEY;

    if (!key || !machineHash || !activationId) {
      return NextResponse.json(
        { ok: false, error: "key, machine_hash, and activation_id are required" },
        { status: 400 },
      );
    }

    if (surface !== "cli" && surface !== "desktop") {
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
      public_key: publicKey,
      token: token.token,
      expires_at: token.expires_at,
      grace_expires_at: token.grace_expires_at,
      surfaces: token.payload.surfaces,
    });
  } catch (error: unknown) {
    const wrappedError = error as ApiError;
    return NextResponse.json(
      { ok: false, error: wrappedError.message || "Refresh failed" },
      { status: wrappedError.status || 500 },
    );
  }
}
