# Deployment Runbook

This runbook covers the full CLI + desktop production flow:

1. Deploy web API (`apps/web`) to Vercel
2. Publish CLI binaries and desktop installers to GitHub Releases
3. Install from `https://local.backgroundrm.com/install`
4. Activate license and process an image

## Binary size and hosting decisions

- Current CLI artifact is not lightweight because of Torch stack.
- Expected per-arch archive size: ~180 MB to ~350 MB.
- Expected unpacked footprint: ~450 MB to ~900 MB.
- v1 hosting decision: public artifacts in GitHub Releases.
- Do not store binary artifacts in git history.

## Preflight

From repo root:

```bash
bun install
bun run lint
bun run test
```

From `apps/rmbg`:

```bash
uv sync --group dev
uv run --group dev pytest -q
uv run python -m py_compile rmbg_cli/cli.py
```

## Deploy web (Vercel)

Vercel should be connected directly to the GitHub repository for automatic deploys on push.
No separate GitHub Action is required for web deployment in this setup.

Set production env vars in Vercel:

- `POLAR_SERVER=production`
- `POLAR_ACCESS_TOKEN`
- `POLAR_ORGANIZATION_ID`
- `POLAR_PRODUCT_CLI_ID`
- `POLAR_PRODUCT_APP_ID`
- `POLAR_PRODUCT_BOTH_ID`
- `POLAR_BENEFIT_CLI_ID`
- `POLAR_BENEFIT_DESKTOP_ID`
- `LICENSE_SIGNING_PRIVATE_KEY`
- `RMBG_LICENSE_PUBLIC_KEY`

Optional:

- `RMBG_LATEST_VERSION` (manual override for `/api/releases/latest`)
- `RMBG_GITHUB_TOKEN` (recommended for private repos so `/api/releases/latest` can resolve latest from GitHub automatically)

If the GitHub repo is private, `RMBG_GITHUB_TOKEN` is required for the `/releases/<tag>/...`
proxy route used by `https://local.backgroundrm.com/install`.

Publish public release files at:

- `https://local.backgroundrm.com/releases/<tag>/rmbg-<tag>-darwin-arm64.tar.gz`
- `https://local.backgroundrm.com/releases/<tag>/checksums.txt`

Note: current automated release workflow publishes arm64 artifacts only.

Then push to `main` (or trigger a deploy from the Vercel dashboard).

Verify:

```bash
curl -i https://local.backgroundrm.com/install
curl -i https://local.backgroundrm.com/api/releases/latest
```

Expected:

- `HTTP/2 200`
- `content-type: text/x-shellscript`

## Publish shared CLI + desktop release

1. Ensure these GitHub Actions secrets are configured for the desktop release job:

- `CSC_LINK`
- `CSC_NAME`
- `CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

2. Bump `apps/rmbg` and `apps/desktop` to the same version.
3. Tag and push:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

4. Wait for the `Release` workflow to finish.
5. Confirm release assets include:

- `rmbg-vX.Y.Z-darwin-arm64.tar.gz`
- `local-background-remover-vX.Y.Z-darwin-arm64.dmg`
- `checksums.txt`

6. Verify checksums:

```bash
gh release download vX.Y.Z --repo cuevaio/local-background-remover -D /tmp/rmbg-release
cd /tmp/rmbg-release
shasum -a 256 -c checksums.txt
```

7. Confirm the downloaded desktop app clears macOS security checks:

```bash
codesign --verify --deep --strict --verbose=2 "/Applications/Local Background Remover.app"
spctl --assess --type execute --verbose=4 "/Applications/Local Background Remover.app"
```

Notes:

- App Store review is not required for the GitHub release `.dmg` flow.
- The desktop release job is expected to sign and notarize macOS artifacts. Missing Apple credentials should fail the workflow rather than publishing unsigned installers.
- The packaged desktop app no longer includes the CLI runtime. On first launch it installs or updates the matching `rmbg` release externally via `https://local.backgroundrm.com/install`, so the CLI artifact for the same version must be published successfully.

## Full user flow test (production)

On a clean macOS machine:

```bash
curl -fsSL https://local.backgroundrm.com/install | bash
export PATH="$HOME/.local/bin:$PATH"
rmbg --version
```

Set runtime env (if not already configured globally):

```bash
export RMBG_LICENSE_API_BASE_URL="https://local.backgroundrm.com"
export RMBG_LICENSE_PUBLIC_KEY="<base64-ed25519-public-key>"
```

Activate and test:

```bash
rmbg license activate --key YOUR_KEY --surface cli --format json
rmbg license status --surface cli --format json
rmbg model ensure --surface cli --format json
rmbg remove --surface cli --input ./butterfly.jpg --output /tmp/out.png --format json
```

Expected:

- `license activate` returns `ok: true`
- `license status` returns `licensed: true`
- `model ensure` succeeds
- `remove` succeeds and writes `/tmp/out.png`

## Negative tests

- Unlicensed machine:
  - `rmbg model ensure --surface cli --format json` should fail with code `6`
  - `rmbg remove --surface cli ...` should fail with code `6`
- Offline after activation:
  - active/grace token should continue to work
  - expired token should fail and request refresh

## Rollback

- Web: rollback to previous Vercel deployment.
- CLI: instruct users to pin prior version:

```bash
curl -fsSL https://local.backgroundrm.com/install | RMBG_VERSION=vPREVIOUS bash
```

- Publish a fixed patch release ASAP.
