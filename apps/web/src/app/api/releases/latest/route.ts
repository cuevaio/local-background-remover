import { NextResponse } from "next/server";

const DEFAULT_GITHUB_REPO = "cuevaio/local-background-remover";

function normalizeTag(value: string | null | undefined) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

function parseTagFromReleaseUrl(url: string) {
  const match = url.match(/\/releases\/tag\/([^/?#]+)/i);
  if (!match?.[1]) {
    return null;
  }

  return normalizeTag(decodeURIComponent(match[1]));
}

async function resolveLatestTag() {
  const configuredTag = normalizeTag(process.env.RMBG_LATEST_VERSION);
  if (configuredTag) {
    return {
      tag: configuredTag,
      source: "env",
    };
  }

  const repoSlug = process.env.RMBG_GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const latestReleaseUrl = `https://github.com/${repoSlug}/releases/latest`;

  const latestReleaseResponse = await fetch(latestReleaseUrl, {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": "local-background-remover/latest-release",
    },
  });

  if (latestReleaseResponse.ok) {
    const redirectedTag = parseTagFromReleaseUrl(latestReleaseResponse.url);
    if (redirectedTag) {
      return {
        tag: redirectedTag,
        source: "github-redirect",
      };
    }
  }

  const githubApiResponse = await fetch(`https://api.github.com/repos/${repoSlug}/releases/latest`, {
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "local-background-remover/latest-release",
    },
  });

  if (githubApiResponse.ok) {
    const payload = (await githubApiResponse.json()) as {
      tag_name?: string;
    };
    const apiTag = normalizeTag(payload.tag_name);
    if (apiTag) {
      return {
        tag: apiTag,
        source: "github-api",
      };
    }
  }

  throw new Error("Unable to resolve latest release tag from GitHub");
}

export async function GET() {
  try {
    const latest = await resolveLatestTag();
    return NextResponse.json(
      {
        ok: true,
        tag: latest.tag,
        source: latest.source,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "RMBG_LATEST_VERSION is not configured";
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
