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

Build and package desktop app:

```bash
cd apps/desktop
bun run dist:mac
```

Artifacts are produced under `apps/desktop/dist-packages`.

Packaged desktop no longer bundles the CLI runtime inside the `.app`. On first packaged launch it installs or updates the matching `rmbg` version externally via `https://local.backgroundrm.com/install`, then uses that installed runtime for processing commands.

By default, local packaging runs unsigned (`CSC_IDENTITY_AUTO_DISCOVERY=false`) unless the full mac signing and notarization env set is present:

- `CSC_LINK`
- `CSC_NAME`
- `CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

If only some of those values are set, packaging fails fast instead of silently producing an unsigned fallback build.

## GitHub release flow

Desktop releases use the same shared `v*` tag flow as the CLI.

1. Keep `apps/rmbg/pyproject.toml` and `apps/desktop/package.json` on the same version.
2. Configure these GitHub Actions secrets before tagging:
   - `CSC_LINK`
   - `CSC_NAME`
   - `CSC_KEY_PASSWORD`
   - `APPLE_ID`
   - `APPLE_APP_SPECIFIC_PASSWORD`
   - `APPLE_TEAM_ID`
3. Push a tag like `v0.3.4`.
4. GitHub Actions builds the CLI archive and signed desktop installers, validates the macOS signature and notarization, then attaches them to one GitHub release.

Expected desktop release assets:

- `local-background-remover-vX.Y.Z-darwin-arm64.dmg`
- `local-background-remover-vX.Y.Z-darwin-arm64.zip`

App Store submission is not required for GitHub-distributed `.dmg` releases, but the release workflow now expects Developer ID signing plus Apple notarization. If those secrets are missing, the desktop release job fails instead of publishing Gatekeeper-blocked installers. The packaged app depends on the matching CLI release artifact being available so it can self-install `rmbg` externally.
