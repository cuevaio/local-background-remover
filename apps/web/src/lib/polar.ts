import { env } from "@/env";

const SANDBOX_API = "https://sandbox-api.polar.sh";
const PROD_API = "https://api.polar.sh";

type ProductKind = "app" | "cli" | "both";
type Surface = "app" | "desktop" | "cli";

type PolarFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

type LicenseRequestPayload = {
  key: string;
  organization_id: string;
  activation_id?: string;
  label?: string;
  conditions?: {
    surface: string;
    machine_hash: string;
  };
  meta?: {
    machine_hash: string;
    surface: string;
  };
};

export type PolarLicense = {
  id: string;
  status: string;
  benefit_id: string;
  expires_at?: string | null;
  usage?: unknown;
  limit_usage?: unknown;
};

type PolarError = Error & { status?: number };

type DiscountListResponse = {
  items?: Array<{
    id?: string;
    code?: string | null;
  }>;
};

const discountIdByCodeCache = new Map<string, string | null>();

export function getPolarApiBase() {
  return env.POLAR_SERVER === "production" ? PROD_API : SANDBOX_API;
}

export function productIdFromKind(kind: ProductKind) {
  const map: Record<ProductKind, string> = {
    app: env.POLAR_PRODUCT_APP_ID,
    cli: env.POLAR_PRODUCT_CLI_ID,
    both: env.POLAR_PRODUCT_BOTH_ID,
  };
  const productId = map[kind];
  return productId;
}

export function normalizeSurface(surface: string): Surface {
  if (surface === "app") {
    return "desktop";
  }
  if (surface === "desktop" || surface === "cli") {
    return surface;
  }
  return "cli";
}

export function requiredBenefitForSurface(surface: Surface) {
  const normalized = normalizeSurface(surface);
  if (normalized === "cli") {
    return env.POLAR_BENEFIT_CLI_ID;
  }
  if (normalized === "desktop") {
    return env.POLAR_BENEFIT_DESKTOP_ID;
  }
  throw new Error(`Unsupported surface '${normalized}'`);
}

export async function polarFetch(path: string, options: PolarFetchOptions = {}) {
  const accessToken = env.POLAR_ACCESS_TOKEN;
  const base = getPolarApiBase();

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  const body = await response.text();
  let parsed: unknown = null;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const parsedRecord = typeof parsed === "object" && parsed ? (parsed as Record<string, string>) : null;
    const message = parsedRecord?.detail || parsedRecord?.error || body || "Polar request failed";
    const error: PolarError = new Error(message);
    error.status = response.status;
    throw error;
  }

  return parsed;
}

export async function findDiscountIdByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  if (discountIdByCodeCache.has(normalizedCode)) {
    return discountIdByCodeCache.get(normalizedCode) ?? null;
  }

  const searchParams = new URLSearchParams({
    organization_id: env.POLAR_ORGANIZATION_ID,
    query: normalizedCode,
    limit: "100",
  });
  const response = (await polarFetch(`/v1/discounts/?${searchParams.toString()}`)) as DiscountListResponse;
  const discountId =
    response.items?.find((item) => item.code?.toUpperCase() === normalizedCode)?.id ?? null;

  discountIdByCodeCache.set(normalizedCode, discountId);
  return discountId;
}

async function customerPortalLicenseRequest(
  path: string,
  payload: LicenseRequestPayload,
  fallbackError: string,
) {
  const base = getPolarApiBase();
  const response = await fetch(`${base}/v1/customer-portal/license-keys/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  let parsed: unknown = null;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const parsedRecord = typeof parsed === "object" && parsed ? (parsed as Record<string, string>) : null;
    const message = parsedRecord?.detail || parsedRecord?.error || body || fallbackError;
    const error: PolarError = new Error(message);
    error.status = response.status;
    throw error;
  }

  return parsed as PolarLicense & { id?: string };
}

export async function activateLicenseKey({
  key,
  organizationId,
  surface,
  machineHash,
}: {
  key: string;
  organizationId: string;
  surface: string;
  machineHash: string;
}) {
  const label = `${surface}-${machineHash.slice(0, 12)}`;
  const conditions = {
    surface,
    machine_hash: machineHash,
  };

  return customerPortalLicenseRequest(
    "activate",
    {
      key,
      organization_id: organizationId,
      label,
      conditions,
      meta: {
        machine_hash: machineHash,
        surface,
      },
    },
    "License activation failed",
  );
}

export async function validateLicenseKey({
  key,
  organizationId,
  activationId,
  surface,
  machineHash,
}: {
  key: string;
  organizationId: string;
  activationId?: string;
  surface?: string;
  machineHash?: string;
}) {
  const payload: LicenseRequestPayload = {
    key,
    organization_id: organizationId,
  };

  if (activationId) {
    payload.activation_id = activationId;
  }

  if (activationId && surface && machineHash) {
    payload.conditions = {
      surface,
      machine_hash: machineHash,
    };
  }

  return customerPortalLicenseRequest("validate", payload, "License validation failed");
}
