# Local Background Remover Desktop

Electron macOS desktop app that shells out to the `rmbg` runtime.

## Local development

From repository root:

```bash
bun run dev
```

Before first use, ensure CLI dependencies are synced:

```bash
cd apps/rmbg
uv sync --group dev
```

The app can trigger model bootstrap automatically on first use.

## License activation

Desktop processing requires both surfaces to be active:

1. Activate your desktop app key.
2. Activate your CLI key.
3. Process images once both status badges are active.

The desktop worker runs with `--surface cli --require-surface desktop` so both entitlements are enforced in runtime checks.

## Save/export

Each image card has `Save Result`, which opens a native save dialog and writes a PNG to your chosen destination.

## Worker behavior

- Persistent `rmbg worker` process avoids reloading model weights per image.
- Worker auto-exits after idle timeout (default 300s).
- Status row reports `sleeping`, `active`, and `warm`.

## Environment variables

Common runtime variables:

- `RMBG_WORKER_IDLE_SECONDS`
- `RMBG_LICENSE_API_BASE_URL`
- `RMBG_LICENSE_PUBLIC_KEY`
- `RMBG_LICENSE_CA_BUNDLE`
- `RMBG_LICENSE_FILE`
- `RMBG_LICENSE_DEVICE_ID`
- `RMBG_LICENSE_DEVICE_ID_FILE`
- `RMBG_DESKTOP_CLI_PATH` (optional override for custom runtime binary)

## Build and package (macOS MVP)

1. Build bundled CLI runtime:

```bash
cd apps/rmbg
bun run package:mac
```

2. Build and package desktop app:

```bash
cd apps/desktop
bun run dist:mac
```

Artifacts are produced under `apps/desktop/dist-packages`.

By default, local packaging runs unsigned (`CSC_IDENTITY_AUTO_DISCOVERY=false`) unless signing env vars are provided (for example `CSC_LINK`/`CSC_NAME` and Apple notarization vars).

## GitHub release flow

Desktop releases use the same shared `v*` tag flow as the CLI.

1. Keep `apps/rmbg/pyproject.toml` and `apps/desktop/package.json` on the same version.
2. Push a tag like `v0.3.4`.
3. GitHub Actions builds the CLI archive and desktop installers, then attaches them to one GitHub release.

Expected desktop release assets:

- `local-background-remover-vX.Y.Z-darwin-arm64.dmg`
- `local-background-remover-vX.Y.Z-darwin-arm64.zip`

The first GitHub-distributed desktop release does not require App Store submission. If signing and notarization secrets are not configured, the workflow will publish unsigned installers so users can try the app immediately, with the usual macOS Gatekeeper warnings.
