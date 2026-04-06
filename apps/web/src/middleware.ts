import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const VISITOR_ID_COOKIE = "rmbg_visitor_id";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  if (request.cookies.has(VISITOR_ID_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set({
    name: VISITOR_ID_COOKIE,
    value: crypto.randomUUID(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
