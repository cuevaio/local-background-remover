# Local Background Remover Monorepo

This repository is a Turborepo for Local Background Remover with three projects:

- `apps/rmbg`: Python CLI for background removal.
- `apps/desktop`: Electron macOS desktop app that uses the CLI.
- `apps/web`: Next.js landing/pricing site + Polar checkout and license endpoints.

## Requirements

- bun
- uv
- Python 3.12+

## Setup

```bash
bun install
cd apps/rmbg && uv sync --group dev
```

## Public install

Downloads are public at:

- `https://local.backgroundrm.com/install`

CLI install command:

```bash
curl -fsSL https://local.backgroundrm.com/install | bash
```

Important: install is public, but CLI/Desktop runtime commands require license activation.

Deployment guide: see `DEPLOYMENT_RUNBOOK.md`.

## Run desktop app

```bash
bun run dev
```

## Run web app

```bash
bun run dev:web
```

Production web deploys are handled by Vercel Git integration (no dedicated GitHub deploy workflow).

## Run CLI directly

```bash
cd apps/rmbg
uv run rmbg license activate --key YOUR_KEY --surface cli --json
uv run rmbg model ensure --json
uv run rmbg remove --input ../../butterfly.jpg --output /tmp/butterfly-rmbg.png --json
```

If you stay in the monorepo root, use `uv run --project apps/rmbg rmbg ...`. Bare `uv run rmbg ...` can resolve to an installed `rmbg` binary outside this repo instead of the editable `apps/rmbg` project.

## Licensing env vars

- API service: `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_WEBHOOK_SECRET`
- Product IDs: `POLAR_PRODUCT_APP_ID`, `POLAR_PRODUCT_CLI_ID`, `POLAR_PRODUCT_BOTH_ID`
- Benefit IDs: `POLAR_BENEFIT_CLI_ID`, `POLAR_BENEFIT_DESKTOP_ID`
- Signing and clients: `LICENSE_SIGNING_PRIVATE_KEY`, `RMBG_LICENSE_PUBLIC_KEY`, `RMBG_LICENSE_API_BASE_URL`, `RMBG_LICENSE_CA_BUNDLE`, `RMBG_WORKER_IDLE_SECONDS`

Desktop processing requires both active keys:

- App key activated in desktop app
- CLI key activated in CLI

## Model behavior

- Default local model path: `~/.cache/background-removal/models/birefnet`
- Override with `BIREFNET_MODEL_DIR`
- First use bootstraps model files to disk if missing
- Runtime inference loads model locally (`local_files_only=True`) so later runs work offline

## License

This repository is proprietary and closed-source. See `LICENSE`.
