# Local Background Remover Desktop

Electron macOS desktop app that uses the `rmbg` CLI internally.

## Run

From repository root:

```bash
bun run dev
```

Before first use, ensure Python dependencies are synced:

```bash
cd ../rmbg
uv sync --group dev
```

The app can trigger model bootstrap automatically on first use.

## License activation

Desktop processing requires two active keys:

1. Activate your app key in the desktop app.
2. Activate your CLI key in the desktop app (CLI section) or in terminal.
3. Process images once both status badges are active.

Desktop uses a persistent rmbg worker process to avoid reloading the model on every image.
The worker auto-exits after an idle timeout (default 300s).
The status row shows worker state (`sleeping`, `active`, `warm`).

Optional:

- `RMBG_WORKER_IDLE_SECONDS` (e.g. `120` for 2 minutes)

Set these env vars for local development:

- `RMBG_LICENSE_API_BASE_URL`
- `RMBG_LICENSE_PUBLIC_KEY`

Desktop invokes CLI commands with `--surface desktop` so entitlement checks remain
consistent between app prechecks and CLI runtime enforcement.
