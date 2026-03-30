# Deployment Runbook

This runbook covers the full CLI production flow:

1. Deploy web API (`apps/web`) to Vercel
2. Publish CLI binaries to GitHub Releases
3. Install from `https://localremovebg.com/install`
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
- `POLAR_PRODUCT_BUNDLE_ID`
- `POLAR_PRODUCT_UPGRADE_ID`
- `POLAR_BENEFIT_CLI_ID`
- `POLAR_BENEFIT_DESKTOP_ID`
- `LICENSE_SIGNING_PRIVATE_KEY`

Then push to `main` (or trigger a deploy from the Vercel dashboard).

Verify:

```bash
curl -i https://localremovebg.com/install
```

Expected:

- `HTTP/2 200`
- `content-type: text/x-shellscript`

## Publish CLI release

1. Bump `apps/rmbg` package version.
2. Tag and push:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

3. Wait for `Release CLI` workflow to finish.
4. Confirm release assets include:

- `rmbg-vX.Y.Z-darwin-arm64.tar.gz`
- `rmbg-vX.Y.Z-darwin-x86_64.tar.gz`
- `checksums.txt`

5. Verify checksums:

```bash
gh release download vX.Y.Z --repo cuevaio/background-removal -D /tmp/rmbg-release
cd /tmp/rmbg-release
shasum -a 256 -c checksums.txt
```

## Full user flow test (production)

On a clean macOS machine:

```bash
curl -fsSL https://localremovebg.com/install | bash
export PATH="$HOME/.local/bin:$PATH"
rmbg --version
```

Set runtime env (if not already configured globally):

```bash
export RMBG_LICENSE_API_BASE_URL="https://localremovebg.com"
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
curl -fsSL https://localremovebg.com/install | RMBG_VERSION=vPREVIOUS bash
```

- Publish a fixed patch release ASAP.
