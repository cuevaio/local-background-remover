# Plan: Auto-cache license public key and adopt T3 env for web (`v0.3.1`)

## Goal
- Remove the requirement for end users to manually set `RMBG_LICENSE_PUBLIC_KEY` after install/activation.
- Centralize and validate web server environment variables using `@t3-oss/env-nextjs`.
- Prepare release metadata for `v0.3.1`.

## Actions
1. Update web license endpoints to include `public_key` in activate/refresh API responses.
2. Persist the returned `public_key` in CLI license activation state and use it for token verification fallback.
3. Add/extend CLI tests for cached-key verification and activation/refresh persistence.
4. Add typed env schema in `apps/web/src/env.ts` and migrate API/lib usage from raw `process.env` reads.
5. Add `@t3-oss/env-nextjs` dependency and update docs for required env variables.
6. Bump CLI versioned files to `0.3.1` and refresh lock metadata.

## Verification
1. `cd apps/rmbg && uv run python -m py_compile rmbg_cli/cli.py`
2. `cd apps/rmbg && uv run --group dev pytest tests/test_license_manager.py tests/test_cli_license.py -q`
3. `cd apps/rmbg && uv run --group dev ruff check rmbg_cli tests`
4. `cd apps/rmbg && uv run --group dev pytest -q`
5. `cd apps/web && bun run build`
