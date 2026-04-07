# AGENTS.md

## Scope
- Instructions for `apps/desktop`.
- `apps/rmbg` owns the actual CLI runtime, model logic, and license enforcement.

## Commands
- Dev: `bun run dev`
- Lint: `bun run lint`
- Test: `bun run test`
- Single test: `bun run build && node --test test/rmbg-runtime.test.cjs`

## Gotchas
- Keep the renderer sandboxed. Anything the UI needs should be exposed explicitly from `src/preload/preload.ts`.
- Main-process runtime launches must stay `shell: false` with explicit argument arrays.
- Runtime resolution order in `src/main/rmbg-runtime.ts`: `RMBG_DESKTOP_CLI_PATH` -> packaged installed `~/.local/bin/rmbg` -> `apps/rmbg/.venv/bin/rmbg` -> `uv run --project apps/rmbg rmbg`.
- Packaged desktop auto-installs the matching `rmbg` version from `https://local.backgroundrm.com/install`.
- Tests import built files from `dist/main/*.js`, so rebuild before running focused `node --test` commands after changing `src/main/**/*`.
- Use the `desktop` surface in desktop-owned runtime/license calls. `app` is only the checkout product name on the web side.
