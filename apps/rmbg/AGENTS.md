# AGENTS.md

## Scope
- Instructions for coding agents working in `apps/rmbg`.
- Project is a Python CLI that owns model bootstrap + inference behavior.

## Tooling
- Package manager: `uv`
- Python version: from `.python-version`
- Lint: `uv run --group dev ruff check rmbg_cli tests`
- Tests: `uv run --group dev pytest -q`

## Core Rules
- Keep model bootstrap idempotent and deterministic.
- Default model path is user disk cache; allow override via `BIREFNET_MODEL_DIR`.
- Load model for inference using local path + `local_files_only=True`.
- Preserve CPU/GPU dtype matching to avoid float/half runtime mismatches.
- Return actionable errors and stable exit codes for CLI consumers.
- Enforce license gating on `model ensure` and `remove`.
- Preserve offline-after-activation behavior (active/grace token windows).
- Keep `--surface` handling consistent for CLI and desktop callers.

## Single Test Pattern
- `uv run --group dev pytest tests/test_model_manager.py::test_validate_local_model_dir_minimal -q`

## Validation Checklist
- Run `uv run python -m py_compile rmbg_cli/cli.py`.
- Run targeted tests first, then `uv run --group dev pytest -q`.
- Run parser/license tests after CLI argument changes.
