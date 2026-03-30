# AGENTS.md

## Scope and Precedence
- This file defines default agent guidance for the repository root: `/Users/cuevaio/projects/background-removal`.
- This repo is a Turborepo with three apps: `apps/rmbg`, `apps/desktop`, and `apps/web`.
- Primary coding agent is OpenCode. Do not rely on Claude Code, Cursor, or Copilot-specific workflows.
- More specific rules in app-level files override this file for local work:
  - `apps/rmbg/AGENTS.md`
  - `apps/desktop/AGENTS.md`
- `apps/web` currently has no local `AGENTS.md`, so root guidance applies there.

## Repository Map
- `apps/rmbg`: Python CLI package (`rmbg`) for model bootstrap, inference, and license enforcement.
- `apps/desktop`: Electron app that shells out to the CLI and exposes IPC to renderer UI.
- `apps/web`: Next.js App Router site for marketing, checkout, download route, and license APIs.
- Root: workspace orchestration (`bun` + `turbo`) and shared env for app coordination.

## Toolchain and Runtime
- JavaScript workspace manager: `bun` (see root `packageManager` in `package.json`).
- Task orchestrator: `turbo` (`turbo.json`).
- Python manager/runtime for CLI: `uv` (`apps/rmbg`).
- Python version for CLI work: `3.12` (`apps/rmbg/.python-version`).
- Next.js version in web app: `15.1.0`.
- Electron version in desktop app: `^37.5.0`.

## Install and Setup
- Install JS dependencies at repo root: `bun install`.
- Sync Python deps for CLI from root: `bun run py:sync`.
- Or sync Python deps directly: `cd apps/rmbg && uv sync --group dev`.
- Optional lock refresh for CLI deps: `bun run py:lock`.

## Commit and Plan Policy
- Keep `.opencode/` tracked in git; do not ignore planning artifacts.
- Every code commit must include its corresponding OpenCode plan file from `.opencode/plans/`.
- When a plan is updated during implementation, include the updated plan in the same commit series.
- Commit messages should reflect both implementation scope and linked plan intent.

## Root Commands (Preferred Entry Points)
- Desktop dev: `bun run dev`.
- Web dev: `bun run dev:web`.
- Monorepo build: `bun run build`.
- Monorepo lint: `bun run lint`.
- Monorepo tests: `bun run test`.
- Combined checks: `bun run check`.

## App Command Matrix
- `apps/rmbg`
  - Dev/status check: `cd apps/rmbg && bun run dev`
  - Build (syntax compile): `cd apps/rmbg && bun run build`
  - Lint (ruff): `cd apps/rmbg && bun run lint`
  - Test (pytest): `cd apps/rmbg && bun run test`
  - Full check: `cd apps/rmbg && bun run check`
  - Package mac binary: `cd apps/rmbg && bun run package:mac`
- `apps/desktop`
  - Dev: `cd apps/desktop && bun run dev`
  - Build/lint/test scripts currently placeholders (they print a message and exit)
- `apps/web`
  - Dev: `cd apps/web && bun run dev`
  - Build: `cd apps/web && bun run build`
  - Start production build: `cd apps/web && bun run start`
  - Lint/test scripts currently placeholders (they print a message and exit)

## Single-Test Guidance (Important)
- Primary single-test workflow is in `apps/rmbg` via `pytest`.
- Run one exact test:
  - `cd apps/rmbg && uv run --group dev pytest tests/test_model_manager.py::test_validate_local_model_dir_minimal -q`
- Additional concrete examples:
  - `cd apps/rmbg && uv run --group dev pytest tests/test_cli_license.py::test_worker_parser_accepts_idle_seconds -q`
  - `cd apps/rmbg && uv run --group dev pytest tests/test_license_manager.py::test_status_active_for_cli -q`
- Run one test file:
  - `cd apps/rmbg && uv run --group dev pytest tests/test_inference_runtime.py -q`
- Run filtered tests by keyword:
  - `cd apps/rmbg && uv run --group dev pytest -k "license and not refresh" -q`
- Desktop/Web single-test commands are currently not applicable (no test harness configured yet).

## Verification Checklist by Change Type
- Any Python CLI change:
  - `cd apps/rmbg && uv run --group dev ruff check rmbg_cli tests`
  - `cd apps/rmbg && uv run --group dev pytest -q`
- CLI entrypoint or parser changes:
  - `cd apps/rmbg && uv run --group dev pytest tests/test_cli_license.py -q`
  - `cd apps/rmbg && uv run python -m py_compile rmbg_cli/cli.py`
- Model bootstrap/inference changes:
  - `cd apps/rmbg && uv run --group dev pytest tests/test_model_manager.py tests/test_inference_runtime.py -q`
- License token/validation changes:
  - `cd apps/rmbg && uv run --group dev pytest tests/test_license_manager.py tests/test_cli_license.py -q`
- Desktop IPC/subprocess changes (manual smoke):
  - Run `bun run dev`, activate keys, ensure model, process one image end-to-end.

## Product Invariants (Do Not Break)
- Public installer URL remains `https://localremovebg.com/install`.
- Downloads are public; runtime commands are license-gated.
- Desktop processing requires both surfaces licensed: `desktop` and `cli`.
- CLI and desktop must enforce license checks before `model ensure` and `remove`.
- Default model path is `~/.cache/background-removal/models/birefnet`.
- `BIREFNET_MODEL_DIR` may override model location.
- Inference must load from local files (`local_files_only=True`) for offline runs.
- Keep offline-after-activation behavior (active + grace windows) intact.

## Environment Variables
- Shared runtime/config envs are defined in `turbo.json` `globalEnv`.
- Core web/license envs (from `.env.example`):
  - `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_WEBHOOK_SECRET`
  - `POLAR_PRODUCT_APP_ID`, `POLAR_PRODUCT_CLI_ID`, `POLAR_PRODUCT_BOTH_ID`
  - `POLAR_BENEFIT_CLI_ID`, `POLAR_BENEFIT_DESKTOP_ID`
  - `LICENSE_SIGNING_PRIVATE_KEY`
  - `RMBG_LICENSE_PUBLIC_KEY`, `RMBG_LICENSE_API_BASE_URL`, `RMBG_WORKER_IDLE_SECONDS`
- Never hardcode secrets; read from env and fail fast with actionable messages.

## Coding Style: General
- Keep changes minimal, targeted, and consistent with surrounding code.
- Prefer small composable functions over large monolithic blocks.
- Avoid introducing new frameworks or major patterns without clear need.
- Preserve existing file/module boundaries unless refactor is intentional.
- Use descriptive names for behavior, not implementation detail.

## Coding Style: Imports and Modules
- Python import order: standard library, third-party, local modules.
- Python imports should be explicit; avoid wildcard imports.
- Web app uses ES modules and path alias `@/*` for `src/*` imports.
- Desktop app uses CommonJS (`require`) in Electron main/preload/renderer files.
- Keep imports grouped and remove unused imports in all languages.

## Coding Style: Formatting and Naming
- Python: 4-space indentation, `snake_case` for functions/vars, `PascalCase` for classes.
- JavaScript: 2-space indentation, semicolons, double quotes, `camelCase` for functions/vars.
- JS constants: `UPPER_SNAKE_CASE` for module-level constants.
- Keep lines readable; prefer clarity over dense one-liners.
- Match existing file conventions before applying personal preferences.

## Coding Style: Types and Data Shapes
- Add Python type hints to new/changed functions when practical.
- Preserve existing typed returns in Python (`-> None`, structured dict returns, etc.).
- In JS, keep API payload fields stable and explicit (`ok`, `error`, status fields).
- Normalize cross-surface terms consistently (`app` maps to `desktop` where required).

## Error Handling Standards
- Fail fast with actionable errors that tell users what to fix.
- Python: avoid bare `except:`; catch specific exceptions when possible.
- When rethrowing in Python, use `raise ... from exc` to preserve causal chain.
- CLI must keep stable exit codes used by integrations:
  - `0` success, `2` input read failure, `3` model failure, `4` inference failure, `5` output write failure, `6` license failure.
- Web API routes should return structured `NextResponse.json` with appropriate HTTP status.
- Desktop main process should propagate subprocess stderr/stdout context to renderer-safe errors.

## Security and IPC Rules
- Keep Electron renderer sandboxed (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).
- Expose only minimal, explicit API surface via preload `contextBridge`.
- Spawn subprocesses with `shell: false` and explicit argument arrays.
- Normalize and validate user-provided file paths in main process before use.
- Do not log secrets, license keys, or raw tokens.

## Agent Workflow Expectations
- Start with targeted checks/tests closest to the changed code.
- Prefer single-test runs before full suites to shorten feedback loop.
- After targeted tests pass, run broader checks relevant to the touched app.
- If scripts are placeholders (desktop/web lint/test), say so explicitly in status updates.
- Do not “upgrade” tooling/config as drive-by work unless task requires it.

## Agent Tooling Note
- Repository automation and instructions are written for OpenCode agent workflows.
- If external assistant config files are added later, treat them as optional context unless explicitly adopted.
