import { NextResponse } from "next/server";

const DEFAULT_GITHUB_REPO = "cuevaio/local-background-remover";

type RouteContext = {
  params: Promise<{
    tag: string;
    asset: string;
  }>;
};

type GitHubRelease = {
  assets?: Array<{
    id: number;
    name: string;
  }>;
};

function isValidTag(tag: string) {
  return /^v[0-9A-Za-z._-]+$/.test(tag);
}

function allowedAssetsForTag(tag: string) {
  return new Set([
    "checksums.txt",
    `rmbg-${tag}-darwin-arm64.tar.gz`,
    `rmbg-${tag}-darwin-x86_64.tar.gz`,
  ]);
}

function buildDownloadHeaders(upstream: Response, assetName: string) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const contentLength = upstream.headers.get("content-length");

  headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Content-Disposition", `attachment; filename="${assetName}"`);

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return headers;
}

async function downloadPublicAsset(repoSlug: string, tag: string, asset: string) {
  const url = `https://github.com/${repoSlug}/releases/download/${tag}/${asset}`;
  return fetch(url, {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": "local-background-remover/releases-proxy",
    },
  });
}

async function downloadPrivateAssetWithToken(
  repoSlug: string,
  tag: string,
  asset: string,
  token: string,
) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "local-background-remover/releases-proxy",
  };

  const releaseResponse = await fetch(`https://api.github.com/repos/${repoSlug}/releases/tags/${tag}`, {
    cache: "no-store",
    headers,
  });

  if (!releaseResponse.ok) {
    return releaseResponse;
  }

  const release = (await releaseResponse.json()) as GitHubRelease;
  const matchedAsset = release.assets?.find((item) => item.name === asset);
  if (!matchedAsset?.id) {
    return new Response(null, { status: 404 });
  }

  return fetch(`https://api.github.com/repos/${repoSlug}/releases/assets/${matchedAsset.id}`, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/octet-stream",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "local-background-remover/releases-proxy",
    },
  });
}

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  const { tag, asset } = await context.params;

  if (!isValidTag(tag)) {
    return NextResponse.json({ ok: false, error: "Invalid release tag" }, { status: 400 });
  }

  if (!allowedAssetsForTag(tag).has(asset)) {
    return NextResponse.json({ ok: false, error: "Unsupported release asset" }, { status: 400 });
  }

  const repoSlug = process.env.RMBG_GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const githubToken = process.env.RMBG_GITHUB_TOKEN || process.env.GITHUB_TOKEN;

  const upstream = githubToken
    ? await downloadPrivateAssetWithToken(repoSlug, tag, asset, githubToken)
    : await downloadPublicAsset(repoSlug, tag, asset);

  if (!upstream.ok || !upstream.body) {
    const errorMessage =
      upstream.status === 404
        ? "Release asset not found"
        : "Failed to fetch release asset from GitHub";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: buildDownloadHeaders(upstream, asset),
  });
}
