# Plan: Make install flow resolve latest release automatically

## Goal
- Ensure `curl -fsSL https://local.backgroundrm.com/install | bash` works without manually setting `RMBG_VERSION` or `RMBG_LATEST_VERSION`.

## Changes
1. Update `apps/web/src/app/api/releases/latest/route.ts`:
   - keep `RMBG_LATEST_VERSION` as an optional override
   - otherwise resolve latest tag from GitHub release redirect (`/releases/latest`)
   - fall back to GitHub releases API if needed
2. Harden `apps/web/src/app/install/route.ts` resolver:
   - preserve manual `RMBG_VERSION` override
   - parse metadata endpoint tag first
   - fall back to GitHub release redirect and then GitHub API
   - improve error message when no tag can be resolved
3. Update docs to reflect that `RMBG_LATEST_VERSION` is optional:
   - `.env.example`
   - `apps/web/README.md`
   - `DEPLOYMENT_RUNBOOK.md`

## Verification
1. Build web app: `cd apps/web && bun run build`
2. Confirm `/api/releases/latest` returns `ok: true` and tag after deployment.
3. Confirm install command resolves latest release automatically:
   - `curl -fsSL https://local.backgroundrm.com/install | bash`
