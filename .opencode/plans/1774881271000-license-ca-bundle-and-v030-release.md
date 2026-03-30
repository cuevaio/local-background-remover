# Plan: Harden license TLS and prepare `v0.3.0`

## Goal
- Ensure CLI license API calls work reliably in packaged binaries by loading trusted CA bundles.
- Ship the release as `v0.3.0` with aligned package/version metadata.

## Actions
1. Add CA bundle resolution in `apps/rmbg/rmbg_cli/license_manager.py` with env override order:
   - `RMBG_LICENSE_CA_BUNDLE`
   - `SSL_CERT_FILE`
   - `REQUESTS_CA_BUNDLE`
   - fallback to default context plus `certifi` roots
2. Use explicit SSL context for license API `urlopen` requests.
3. Add tests for CA bundle behavior and missing-path error handling.
4. Add `certifi` dependency and refresh lock/metadata files.
5. Bump CLI versioned files from `0.2.0` to `0.3.0`.
6. Update docs/env examples for the optional `RMBG_LICENSE_CA_BUNDLE` setting.

## Verification
1. `cd apps/rmbg && uv run python -m py_compile rmbg_cli/cli.py`
2. `cd apps/rmbg && uv run --group dev pytest tests/test_cli_license.py tests/test_license_manager.py -q`
3. `cd apps/rmbg && uv run --group dev ruff check rmbg_cli tests`
4. `cd apps/rmbg && uv run --group dev pytest -q`
