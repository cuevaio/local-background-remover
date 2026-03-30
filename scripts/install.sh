#!/usr/bin/env bash

set -euo pipefail

REPO_SLUG="cuevaio/background-removal"
RELEASE_BASE_URL="${RMBG_RELEASE_BASE_URL:-https://github.com/${REPO_SLUG}/releases}"
INSTALL_BIN_DIR="${RMBG_INSTALL_BIN_DIR:-$HOME/.local/bin}"
INSTALL_BASE_DIR="${RMBG_INSTALL_BASE_DIR:-$HOME/.local/share/rmbg}"

fail() {
  printf "rmbg install error: %s\n" "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

detect_target() {
  local os arch
  os="$(uname -s)"
  arch="$(uname -m)"

  if [[ "$os" != "Darwin" ]]; then
    fail "unsupported OS: $os (macOS only for now)"
  fi

  case "$arch" in
    arm64) echo "darwin-arm64" ;;
    x86_64) echo "darwin-x86_64" ;;
    *) fail "unsupported architecture: $arch" ;;
  esac
}

resolve_tag() {
  if [[ -n "${RMBG_VERSION:-}" ]]; then
    local requested="${RMBG_VERSION}"
    if [[ "$requested" == v* ]]; then
      echo "$requested"
    else
      echo "v${requested}"
    fi
    return
  fi

  local api_url="https://api.github.com/repos/${REPO_SLUG}/releases/latest"
  local tag
  tag="$(curl -fsSL "$api_url" | grep '"tag_name"' | head -n1 | sed -E 's/.*"tag_name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
  [[ -n "$tag" ]] || fail "failed to resolve latest release tag"
  echo "$tag"
}

verify_checksum() {
  local archive_file checksums_file
  archive_file="$1"
  checksums_file="$2"
  local expected actual

  expected="$(grep "  $(basename "$archive_file")" "$checksums_file" | awk '{print $1}')"
  [[ -n "$expected" ]] || fail "checksum entry not found for archive"

  actual="$(shasum -a 256 "$archive_file" | awk '{print $1}')"
  [[ "$expected" == "$actual" ]] || fail "checksum verification failed"
}

main() {
  need_cmd curl
  need_cmd tar
  need_cmd shasum

  local target tag archive_name download_base
  target="$(detect_target)"
  tag="$(resolve_tag)"
  archive_name="rmbg-${tag}-${target}.tar.gz"
  download_base="${RELEASE_BASE_URL}/download/${tag}"

  local tmp_dir archive_path checksums_path
  tmp_dir="$(mktemp -d)"
  trap 'if [[ -n "${tmp_dir:-}" ]]; then rm -rf "$tmp_dir"; fi' EXIT
  archive_path="$tmp_dir/$archive_name"
  checksums_path="$tmp_dir/checksums.txt"

  printf "Installing rmbg %s for %s\n" "$tag" "$target"
  curl -fsSL "${download_base}/${archive_name}" -o "$archive_path"
  curl -fsSL "${download_base}/checksums.txt" -o "$checksums_path"

  verify_checksum "$archive_path" "$checksums_path"

  local release_dir target_dir
  release_dir="$INSTALL_BASE_DIR/$tag"
  target_dir="$release_dir/$target"
  rm -rf "$target_dir"
  mkdir -p "$target_dir"
  tar -xzf "$archive_path" -C "$target_dir"

  local installed_bin
  installed_bin="$(find "$target_dir" -type f -name rmbg | head -n1)"
  [[ -x "$installed_bin" ]] || fail "installed rmbg binary not found"

  mkdir -p "$INSTALL_BIN_DIR"
  ln -sf "$installed_bin" "$INSTALL_BIN_DIR/rmbg"

  printf "Installed rmbg to %s\n" "$INSTALL_BIN_DIR/rmbg"
  printf "Run: rmbg --version\n"

  case ":${PATH}:" in
    *":${INSTALL_BIN_DIR}:"*) ;;
    *)
      printf "\nAdd %s to PATH if needed:\n" "$INSTALL_BIN_DIR"
      printf "  export PATH=\"%s:\$PATH\"\n" "$INSTALL_BIN_DIR"
      ;;
  esac
}

main "$@"
