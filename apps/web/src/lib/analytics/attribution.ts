import type { NextRequest } from "next/server";

export const ATTRIBUTION_COOKIE = "rmbg_attribution";
export const VISITOR_ID_COOKIE = "rmbg_visitor_id";
export const ATTRIBUTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const TRACKED_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "exp",
] as const;

type TrackedQueryKey = (typeof TRACKED_QUERY_KEYS)[number];

export type StoredAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  exp?: string;
  landing_path?: string;
  referrer_host?: string;
  first_seen_at?: string;
  last_seen_at?: string;
};

export type AnalyticsAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_path?: string;
  referrer_host?: string;
  has_gclid: boolean;
  has_gbraid: boolean;
  has_wbraid: boolean;
};

function cleanString(value: string | null | undefined, maxLength = 500): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

function parseReferrerHost(value: string | null): string | undefined {
  const referrer = cleanString(value, 2048);
  if (!referrer) {
    return undefined;
  }

  try {
    return cleanString(new URL(referrer).host.toLowerCase(), 255);
  } catch {
    return undefined;
  }
}

function collectTrackedParams(url: URL): Partial<Record<TrackedQueryKey, string>> {
  const params: Partial<Record<TrackedQueryKey, string>> = {};

  for (const key of TRACKED_QUERY_KEYS) {
    const value = cleanString(url.searchParams.get(key));
    if (value) {
      params[key] = value;
    }
  }

  return params;
}

function hasTrackedValues(attribution: Partial<StoredAttribution>): boolean {
  return TRACKED_QUERY_KEYS.some((key) => Boolean(attribution[key]));
}

export function parseAttributionCookie(cookieValue: string | undefined): StoredAttribution | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as StoredAttribution;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      utm_source: cleanString(parsed.utm_source),
      utm_medium: cleanString(parsed.utm_medium),
      utm_campaign: cleanString(parsed.utm_campaign),
      utm_content: cleanString(parsed.utm_content),
      utm_term: cleanString(parsed.utm_term),
      gclid: cleanString(parsed.gclid),
      gbraid: cleanString(parsed.gbraid),
      wbraid: cleanString(parsed.wbraid),
      exp: cleanString(parsed.exp),
      landing_path: cleanString(parsed.landing_path, 255),
      referrer_host: cleanString(parsed.referrer_host, 255),
      first_seen_at: cleanString(parsed.first_seen_at, 64),
      last_seen_at: cleanString(parsed.last_seen_at, 64),
    };
  } catch {
    return null;
  }
}

export function serializeAttributionCookie(attribution: StoredAttribution): string {
  return encodeURIComponent(JSON.stringify(attribution));
}

export function readAttributionFromRequest(request: NextRequest): StoredAttribution | null {
  return parseAttributionCookie(request.cookies.get(ATTRIBUTION_COOKIE)?.value);
}

export function updateAttributionFromRequest(
  request: NextRequest,
  existingAttribution: StoredAttribution | null,
): StoredAttribution | null {
  const trackedParams = collectTrackedParams(request.nextUrl);
  const referrerHost = parseReferrerHost(request.headers.get("referer"));
  const hasSignal = hasTrackedValues(trackedParams) || Boolean(referrerHost);

  if (!existingAttribution && !hasSignal) {
    return null;
  }

  const now = new Date().toISOString();

  if (!existingAttribution) {
    return {
      ...trackedParams,
      landing_path: cleanString(request.nextUrl.pathname, 255),
      referrer_host: referrerHost,
      first_seen_at: now,
      last_seen_at: now,
    };
  }

  if (!hasSignal) {
    return existingAttribution;
  }

  return {
    ...existingAttribution,
    ...trackedParams,
    landing_path: existingAttribution.landing_path || cleanString(request.nextUrl.pathname, 255),
    referrer_host: existingAttribution.referrer_host || referrerHost,
    first_seen_at: existingAttribution.first_seen_at || now,
    last_seen_at: now,
  };
}

export function withExperiment(attribution: StoredAttribution | null, exp: string): StoredAttribution | null {
  const resolvedExp = cleanString(exp);
  if (!resolvedExp) {
    return attribution;
  }

  return {
    ...(attribution || {}),
    exp: resolvedExp,
  };
}

export function toAnalyticsAttribution(attribution: StoredAttribution | null | undefined): AnalyticsAttribution {
  return {
    utm_source: attribution?.utm_source,
    utm_medium: attribution?.utm_medium,
    utm_campaign: attribution?.utm_campaign,
    utm_content: attribution?.utm_content,
    utm_term: attribution?.utm_term,
    landing_path: attribution?.landing_path,
    referrer_host: attribution?.referrer_host,
    has_gclid: Boolean(attribution?.gclid),
    has_gbraid: Boolean(attribution?.gbraid),
    has_wbraid: Boolean(attribution?.wbraid),
  };
}

export function toPolarMetadata(attribution: StoredAttribution | null | undefined, kind?: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  const mapping: Array<[string, string | undefined]> = [
    ["kind", kind],
    ["attr_exp", attribution?.exp],
    ["attr_lp", attribution?.landing_path],
    ["attr_ref", attribution?.referrer_host],
    ["attr_usrc", attribution?.utm_source],
    ["attr_umed", attribution?.utm_medium],
    ["attr_ucmp", attribution?.utm_campaign],
    ["attr_ucon", attribution?.utm_content],
    ["attr_utrm", attribution?.utm_term],
    ["attr_gclid", attribution?.gclid],
    ["attr_gbraid", attribution?.gbraid],
    ["attr_wbraid", attribution?.wbraid],
  ];

  for (const [key, value] of mapping) {
    const resolved = cleanString(value);
    if (resolved) {
      metadata[key] = resolved;
    }
  }

  return metadata;
}
