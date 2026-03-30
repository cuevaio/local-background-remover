#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$ROOT_DIR/build"

rm -rf "$DIST_DIR" "$BUILD_DIR"

cd "$ROOT_DIR"
uv sync --group build --no-dev
uv run --group build pyinstaller pyinstaller.spec --clean --noconfirm

ARCH="$(uname -m)"
case "$ARCH" in
  arm64) TARGET="darwin-arm64" ;;
  x86_64) TARGET="darwin-x86_64" ;;
  *) TARGET="darwin-unknown" ;;
esac

VERSION="$(uv run python -c "import importlib.metadata as m; print(m.version('rmbg'))")"
TAG="v${VERSION}"
ARCHIVE="rmbg-${TAG}-${TARGET}.tar.gz"

mkdir -p "$DIST_DIR/release"
tar -czf "$DIST_DIR/release/$ARCHIVE" -C "$DIST_DIR" rmbg

cd "$DIST_DIR/release"
shasum -a 256 "$ARCHIVE" > checksums.txt

printf "Built %s\n" "$DIST_DIR/release/$ARCHIVE"
