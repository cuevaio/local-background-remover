import { NextResponse } from "next/server";

const installScript = `#!/usr/bin/env bash
set -euo pipefail

REPO_SLUG="\${RMBG_GITHUB_REPO:-cuevaio/local-background-remover}"
RELEASE_BASE_URL="\${RMBG_RELEASE_BASE_URL:-https://local.backgroundrm.com/releases}"
RELEASE_METADATA_URL="\${RMBG_RELEASE_METADATA_URL:-https://local.backgroundrm.com/api/releases/latest}"
INSTALL_BIN_DIR="\${RMBG_INSTALL_BIN_DIR:-\$HOME/.local/bin}"
INSTALL_BASE_DIR="\${RMBG_INSTALL_BASE_DIR:-\$HOME/.local/share/rmbg}"
TAG_SOURCE=""

fail() {
  printf "rmbg install error: %s\\n" "\$1" >&2
  exit 1
}

need_cmd() {
  command -v "\$1" >/dev/null 2>&1 || fail "missing required command: \$1"
}

detect_target() {
  local os arch
  os="\$(uname -s)"
  arch="\$(uname -m)"

  if [[ "\$os" != "Darwin" ]]; then
    fail "unsupported OS: \$os (macOS only for now)"
  fi

  case "\$arch" in
    arm64) echo "darwin-arm64" ;;
    x86_64) echo "darwin-x86_64" ;;
    *) fail "unsupported architecture: \$arch" ;;
  esac
}

ensure_v_tag() {
  local value
  value="\$1"
  if [[ "\$value" == v* ]]; then
    echo "\$value"
  else
    echo "v\${value}"
  fi
}

resolve_tag() {
  local requested tag metadata_json latest_url

  if [[ -n "\${RMBG_VERSION:-}" ]]; then
    TAG_SOURCE="manual"
    requested="\${RMBG_VERSION}"
    ensure_v_tag "\$requested"
    return
  fi

  if [[ -n "\${RELEASE_METADATA_URL:-}" ]]; then
    metadata_json="\$(curl -fsSL "\$RELEASE_METADATA_URL" 2>/dev/null || true)"
    tag="\$(printf "%s" "\$metadata_json" | sed -nE 's/.*"tag"[[:space:]]*:[[:space:]]*"([^"]+)".*/\\1/p')"
    if [[ -n "\$tag" ]]; then
      TAG_SOURCE="metadata"
      ensure_v_tag "\$tag"
      return
    fi
  fi

  if [[ -n "\${REPO_SLUG:-}" ]]; then
    latest_url="\$(curl -fsSL -o /dev/null -w '%{url_effective}' "https://github.com/\${REPO_SLUG}/releases/latest" 2>/dev/null || true)"
    tag="\$(printf "%s" "\$latest_url" | sed -nE 's#^.*/releases/tag/([^/?#]+).*$#\\1#p')"
    if [[ -n "\$tag" ]]; then
      TAG_SOURCE="github-redirect"
      ensure_v_tag "\$tag"
      return
    fi

    local api_url
    api_url="https://api.github.com/repos/\${REPO_SLUG}/releases/latest"
    tag="\$({ curl -fsSL "\$api_url" 2>/dev/null || true; } | sed -nE 's/.*"tag_name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\\1/p')"
    if [[ -n "\$tag" ]]; then
      TAG_SOURCE="github-api"
      ensure_v_tag "\$tag"
      return
    fi
  fi

  fail "failed to resolve release version from metadata or GitHub; set RMBG_VERSION=vX.Y.Z"
}

verify_checksum() {
  local archive_file checksums_file
  archive_file="\$1"
  checksums_file="\$2"
  local expected actual

  expected="\$(grep "  \$(basename "\$archive_file")" "\$checksums_file" | awk '{print \$1}')"
  [[ -n "\$expected" ]] || fail "checksum entry not found for archive"

  actual="\$(shasum -a 256 "\$archive_file" | awk '{print \$1}')"
  [[ "\$expected" == "\$actual" ]] || fail "checksum verification failed"
}

download_release_assets() {
  local primary_base fallback_base archive_name archive_path checksums_path
  primary_base="\$1"
  fallback_base="\$2"
  archive_name="\$3"
  archive_path="\$4"
  checksums_path="\$5"

  if curl -fsSL "\${primary_base}/\${archive_name}" -o "\$archive_path" && \
    curl -fsSL "\${primary_base}/checksums.txt" -o "\$checksums_path"; then
    return
  fi

  if [[ -n "\$fallback_base" && "\$fallback_base" != "\$primary_base" ]]; then
    printf "Primary release source unavailable, falling back to GitHub assets\\n" >&2
    curl -fsSL "\${fallback_base}/\${archive_name}" -o "\$archive_path" ||
      fail "failed to download archive from fallback release source. For private repos, set RMBG_GITHUB_TOKEN in web env or set RMBG_RELEASE_BASE_URL to a public mirror"
    curl -fsSL "\${fallback_base}/checksums.txt" -o "\$checksums_path" ||
      fail "failed to download checksums from fallback release source. For private repos, set RMBG_GITHUB_TOKEN in web env or set RMBG_RELEASE_BASE_URL to a public mirror"
    return
  fi

  fail "failed to download release assets. Set RMBG_RELEASE_BASE_URL to a working mirror, or configure RMBG_GITHUB_TOKEN in web env for private GitHub releases"
}

main() {
  need_cmd curl
  need_cmd tar
  need_cmd shasum

  local target tag archive_name download_base github_download_base
  target="\$(detect_target)"
  tag="\$(resolve_tag)"
  archive_name="rmbg-\${tag}-\${target}.tar.gz"
  github_download_base="https://github.com/\${REPO_SLUG}/releases/download/\${tag}"
  if [[ "\${TAG_SOURCE}" == github-* && -z "\${RMBG_RELEASE_BASE_URL:-}" ]]; then
    download_base="\$github_download_base"
  else
    download_base="\${RELEASE_BASE_URL}/\${tag}"
  fi

  local tmp_dir archive_path checksums_path
  tmp_dir="\$(mktemp -d)"
  trap 'if [[ -n "\${tmp_dir:-}" ]]; then rm -rf "\$tmp_dir"; fi' EXIT
  archive_path="\$tmp_dir/\$archive_name"
  checksums_path="\$tmp_dir/checksums.txt"

  printf "Installing rmbg %s for %s\\n" "\$tag" "\$target"
  download_release_assets "\$download_base" "\$github_download_base" "\$archive_name" "\$archive_path" "\$checksums_path"

  verify_checksum "\$archive_path" "\$checksums_path"

  local release_dir target_dir
  release_dir="\$INSTALL_BASE_DIR/\$tag"
  target_dir="\$release_dir/\$target"
  rm -rf "\$target_dir"
  mkdir -p "\$target_dir"
  tar -xzf "\$archive_path" -C "\$target_dir"

  local installed_bin
  installed_bin="\$(find "\$target_dir" -type f -name rmbg | head -n1)"
  [[ -x "\$installed_bin" ]] || fail "installed rmbg binary not found"

  mkdir -p "\$INSTALL_BIN_DIR"
  ln -sf "\$installed_bin" "\$INSTALL_BIN_DIR/rmbg"

  printf "Installed rmbg to %s\\n" "\$INSTALL_BIN_DIR/rmbg"
  printf "Run: rmbg --version\\n"

  case ":\${PATH}:" in
    *":\${INSTALL_BIN_DIR}:"*) ;;
    *)
      printf "\\nAdd %s to PATH if needed:\\n" "\$INSTALL_BIN_DIR"
      printf "  export PATH=\"%s:\\\$PATH\"\\n" "\$INSTALL_BIN_DIR"
      ;;
  esac
}

main "\$@"
`;

export async function GET() {
  return new NextResponse(installScript, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
