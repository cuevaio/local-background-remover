import { NextResponse } from "next/server";

function normalizeTag(value: string | undefined) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

export async function GET() {
  const tag = normalizeTag(process.env.RMBG_LATEST_VERSION);
  if (!tag) {
    return NextResponse.json(
      {
        ok: false,
        error: "RMBG_LATEST_VERSION is not configured",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      tag,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=120",
      },
    },
  );
}
