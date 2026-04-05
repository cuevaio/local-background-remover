# Local Background Remover CLI (`rmbg`)

Command-line background removal tool built with Python + uv.

## Setup

```bash
cd apps/rmbg
uv sync --group dev
```

## Commands

```bash
cd apps/rmbg
uv run rmbg license activate --key YOUR_KEY --json
uv run rmbg license status --json
uv run rmbg license refresh --json
uv run rmbg model status --json
uv run rmbg model ensure --format json
uv run rmbg remove --input ../../butterfly.jpg --output /tmp/butterfly-rmbg.png --format json
```

When working from the monorepo root, use `uv run --project apps/rmbg rmbg ...` instead of bare `uv run rmbg ...` so uv resolves the editable CLI project rather than an installed binary elsewhere on your machine.

Use `rmbg --help` and `rmbg <command> --help` for full command docs.

Output flags:

- `--format text|json` (recommended)
- `--json` (legacy alias)

Set these env vars before activating:

- `RMBG_LICENSE_API_BASE_URL`
- `RMBG_LICENSE_PUBLIC_KEY`
- `RMBG_LICENSE_CA_BUNDLE` (optional, path to PEM bundle for TLS verification)

`RMBG_LICENSE_CA_BUNDLE`, `SSL_CERT_FILE`, and `REQUESTS_CA_BUNDLE` also apply to HTTPS image downloads for `--input https://...`.

Note: the desktop app manages any internal license context itself.

## Model behavior

- Default local model path: `~/.cache/background-removal/models/birefnet`
- Override path with `BIREFNET_MODEL_DIR`
- If model files are missing, `ensure`/`remove` will download once.
- Runtime inference loads model locally with offline flags and `local_files_only=True`.

## Exit codes

- `0`: success
- `2`: input image read/validation failure
- `3`: model bootstrap/model availability failure
- `4`: inference failure
- `5`: output write failure
- `6`: license validation/activation failure
