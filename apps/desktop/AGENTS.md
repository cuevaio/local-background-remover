# AGENTS.md

## Scope
- Instructions for coding agents working in `apps/desktop`.
- App is an Electron desktop client that calls `rmbg` via subprocess.

## Core Rules
- Keep renderer sandboxed; no direct Node access in renderer.
- Expose a minimal API through preload + IPC.
- Spawn CLI with `shell: false` and explicit args.
- Treat all file paths as untrusted input and normalize paths in main process.
- Surface clear error messages for CLI failures.

## Commands
- Dev: `bun run dev`
- Build placeholder: `bun run build`

## UI Guidance
- Keep UI minimal and intentional.
- Preserve a clear before/after comparison workflow.
- Show explicit states: idle, processing, done, failed.
