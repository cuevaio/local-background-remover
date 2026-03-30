# Plan: Align CLI package version with release tag `v0.2.0`

## Goal
- Fix the GitHub `Release CLI` workflow failure where tag `v0.2.0` does not match the `rmbg` package version.

## Actions
1. Bump `apps/rmbg/pyproject.toml` project version from `0.1.0` to `0.2.0`.
2. Update CLI fallback version constant in `apps/rmbg/rmbg_cli/cli.py` to `0.2.0` for consistency when package metadata is unavailable.
3. Regenerate `apps/rmbg/uv.lock` so lock metadata reflects the new package version.

## Verification
1. Run the release-check logic locally:
   - `cd apps/rmbg && uv sync --group build`
   - `TAG=v0.2.0 PROJECT_VERSION="$(cd apps/rmbg && uv run python -c "import importlib.metadata as m; print(m.version('rmbg'))")"`
   - Confirm `v${PROJECT_VERSION}` equals `${TAG}`.
