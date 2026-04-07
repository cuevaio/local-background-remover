import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_COOKIE_MAX_AGE,
  VISITOR_ID_COOKIE,
  readAttributionFromRequest,
  serializeAttributionCookie,
  updateAttributionFromRequest,
} from "@/lib/analytics/attribution";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.has(VISITOR_ID_COOKIE)) {
    response.cookies.set({
      name: VISITOR_ID_COOKIE,
      value: crypto.randomUUID(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_IN_SECONDS,
    });
  }

  const nextAttribution = updateAttributionFromRequest(request, readAttributionFromRequest(request));
  if (nextAttribution) {
    response.cookies.set({
      name: ATTRIBUTION_COOKIE,
      value: serializeAttributionCookie(nextAttribution),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
