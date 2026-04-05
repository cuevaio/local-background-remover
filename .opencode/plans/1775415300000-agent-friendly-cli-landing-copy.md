# Agent-Friendly CLI Landing Copy

## Goal
- Refresh the web landing content to better explain agent workflows and modernize the CLI quickstart.

## Scope
- Update the home page "Using with agents" section to use Claude Code and OpenCode GIFs.
- Explain that the `rmbg` CLI is agent-friendly and works well for folders, batches, and repeated workflows.
- Update timing references to 1.2 - 1.5 seconds per image across touched web content.
- Replace the three-command CLI quickstart with a single example command, JSON output, and an interactive before/after comparison.

## Files
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/docs/page.tsx`
- `apps/web/src/components/marketing/AutomationChats.tsx`
- `apps/web/src/components/marketing/InputOptionsSection.tsx`
- `apps/web/src/components/marketing/QuickstartComparison.tsx`
- `apps/web/src/components/marketing/WorkflowComparison.tsx`

## Verification
- Run `bun run build` in `apps/web`.
