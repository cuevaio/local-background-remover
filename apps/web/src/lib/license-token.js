import crypto from "node:crypto";

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;
const THREE_DAYS_SECONDS = 3 * 24 * 60 * 60;

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function normalizePrivateKey(raw) {
  const trimmed = raw.trim();
  if (trimmed.includes("BEGIN PRIVATE KEY")) {
    return trimmed;
  }

  const bytes = Buffer.from(trimmed, "base64");
  if (bytes.length !== 32) {
    throw new Error(
      "LICENSE_SIGNING_PRIVATE_KEY must be base64 32-byte Ed25519 private key or PEM",
    );
  }

  const prefix = Buffer.from("302e020100300506032b657004220420", "hex");
  const der = Buffer.concat([prefix, bytes]);
  const b64 = der.toString("base64").match(/.{1,64}/g).join("\n");
  return `-----BEGIN PRIVATE KEY-----\n${b64}\n-----END PRIVATE KEY-----`;
}

function getPrivateKey() {
  const key = process.env.LICENSE_SIGNING_PRIVATE_KEY;
  if (!key) {
    throw new Error("Missing environment variable: LICENSE_SIGNING_PRIVATE_KEY");
  }
  return crypto.createPrivateKey(normalizePrivateKey(key));
}

function fingerprintLicenseKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex").slice(0, 20);
}

export function issueOfflineToken({ license, key, surface, machineHash, activationId }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + THIRTY_DAYS_SECONDS;
  const graceExp = exp + THREE_DAYS_SECONDS;
  const payload = {
    iss: "background-removal",
    aud: "rmbg",
    iat: now,
    exp,
    grace_exp: graceExp,
    license_id: license.id,
    benefit_id: license.benefit_id,
    key_fingerprint: fingerprintLicenseKey(key),
    machine_hash: machineHash,
    activation_id: activationId || null,
    surfaces: [surface],
    status: license.status,
  };

  const header = { alg: "EdDSA", typ: "RMBG-LIC-V1" };
  const encodedHeader = toBase64Url(Buffer.from(JSON.stringify(header), "utf-8"));
  const encodedPayload = toBase64Url(Buffer.from(JSON.stringify(payload), "utf-8"));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = getPrivateKey();
  const signature = crypto.sign(null, Buffer.from(signingInput, "utf-8"), privateKey);

  return {
    token: `${signingInput}.${toBase64Url(signature)}`,
    expires_at: exp,
    grace_expires_at: graceExp,
    payload,
  };
}
