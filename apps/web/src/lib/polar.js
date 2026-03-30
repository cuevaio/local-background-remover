const SANDBOX_API = "https://sandbox-api.polar.sh";
const PROD_API = "https://api.polar.sh";

export function getPolarApiBase() {
  return process.env.POLAR_SERVER === "production" ? PROD_API : SANDBOX_API;
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function productIdFromKind(kind) {
  const map = {
    app: process.env.POLAR_PRODUCT_APP_ID,
    cli: process.env.POLAR_PRODUCT_CLI_ID,
    both: process.env.POLAR_PRODUCT_BOTH_ID,
  };
  const productId = map[kind];
  if (!productId) {
    throw new Error(`Missing product ID for kind '${kind}'`);
  }
  return productId;
}

export function normalizeSurface(surface) {
  if (surface === "app") {
    return "desktop";
  }
  return surface;
}

export function requiredBenefitForSurface(surface) {
  const normalized = normalizeSurface(surface);
  if (normalized === "cli") {
    return requireEnv("POLAR_BENEFIT_CLI_ID");
  }
  if (normalized === "desktop") {
    return requireEnv("POLAR_BENEFIT_DESKTOP_ID");
  }
  throw new Error(`Unsupported surface '${normalized}'`);
}

export async function polarFetch(path, options = {}) {
  const accessToken = requireEnv("POLAR_ACCESS_TOKEN");
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
  let parsed = null;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message = parsed?.detail || parsed?.error || body || "Polar request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return parsed;
}

async function customerPortalLicenseRequest(path, payload, fallbackError) {
  const base = getPolarApiBase();
  const response = await fetch(`${base}/v1/customer-portal/license-keys/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  let parsed = null;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message = parsed?.detail || parsed?.error || body || fallbackError;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return parsed;
}

export async function activateLicenseKey({ key, organizationId, surface, machineHash }) {
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
}) {
  const payload = {
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
