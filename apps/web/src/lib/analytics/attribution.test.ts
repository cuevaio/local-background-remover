import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";

import {
  ATTRIBUTION_COOKIE,
  parseAttributionCookie,
  serializeAttributionCookie,
  updateAttributionFromRequest,
} from "./attribution";

describe("analytics attribution", () => {
  test("creates an attribution record from tagged landing traffic", () => {
    const request = new NextRequest(
      "https://local.backgroundrm.com/?utm_source=google&utm_medium=cpc&utm_campaign=launch&gclid=test-click&exp=hhh:mac_app",
      {
        headers: {
          referer: "https://www.google.com/search?q=background+remover+for+mac",
        },
      },
    );

    const attribution = updateAttributionFromRequest(request, null);

    expect(attribution).not.toBeNull();
    expect(attribution).toMatchObject({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "launch",
      gclid: "test-click",
      exp: "hhh:mac_app",
      landing_path: "/",
      referrer_host: "www.google.com",
    });
    expect(attribution?.first_seen_at).toBeString();
    expect(attribution?.last_seen_at).toBeString();
  });

  test("preserves first-touch landing data while updating experiment context", () => {
    const existing = {
      utm_source: "google",
      landing_path: "/",
      referrer_host: "www.google.com",
      first_seen_at: "2026-04-07T10:00:00.000Z",
      last_seen_at: "2026-04-07T10:00:00.000Z",
    };

    const request = new NextRequest("https://local.backgroundrm.com/pricing?exp=hhh:product_photos");
    const updated = updateAttributionFromRequest(request, existing);

    expect(updated).toMatchObject({
      utm_source: "google",
      landing_path: "/",
      referrer_host: "www.google.com",
      exp: "hhh:product_photos",
      first_seen_at: "2026-04-07T10:00:00.000Z",
    });
    expect(updated?.last_seen_at).not.toBe("2026-04-07T10:00:00.000Z");
  });

  test("round-trips the attribution cookie payload", () => {
    const value = {
      utm_source: "google",
      utm_medium: "cpc",
      landing_path: "/",
      gclid: "test-click",
      exp: "hhh:mac_app",
    };

    const encoded = serializeAttributionCookie(value);
    const parsed = parseAttributionCookie(encoded);

    expect(parsed).toEqual(value);
    expect(
      parseAttributionCookie(
        new NextRequest("https://local.backgroundrm.com", {
          headers: {
            cookie: `${ATTRIBUTION_COOKIE}=${encoded}`,
          },
        }).cookies.get(ATTRIBUTION_COOKIE)?.value,
      ),
    ).toEqual(value);
  });
});
