# Local Background Remover CLI (`rmbg`)

Command-line background removal tool built with Python + uv.

## Setup

```bash
uv sync --group dev
```

## Commands

```bash
uv run rmbg license activate --key YOUR_KEY --surface cli --json
uv run rmbg license status --surface cli --json
uv run rmbg license refresh --surface cli --json
uv run rmbg model status --json
uv run rmbg model ensure --surface cli --format json
uv run rmbg remove --surface cli --input ../../butterfly.jpg --output /tmp/butterfly-rmbg.png --format json
uv run rmbg remove --surface cli --require-surface desktop --input ../../butterfly.jpg --output /tmp/butterfly-rmbg.png --format json
```

Use `rmbg --help` and `rmbg <command> --help` for full command docs.

Output flags:

- `--format text|json` (recommended)
- `--json` (legacy alias)

Set these env vars before activating:

- `RMBG_LICENSE_API_BASE_URL`
- `RMBG_LICENSE_PUBLIC_KEY`
- `RMBG_LICENSE_CA_BUNDLE` (optional, path to PEM bundle for TLS verification)

Note: desktop app processing uses CLI internally and requires both `desktop` and `cli`
surface activations.

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
