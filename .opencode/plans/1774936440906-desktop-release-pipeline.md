# Plan: Desktop GitHub release pipeline on shared product tags

## Goal
- Publish desktop installers to GitHub Releases using the same shared `v*` tag flow as the CLI.
- Ensure the desktop installer is attached to the release so users can download it directly from GitHub.
- Keep the first release path fast by shipping unsigned installers first, without blocking on Apple notarization or App Store review.

## Scope Decisions
- Reuse the current repo-level release model: pushing a `vX.Y.Z` tag triggers GitHub Actions and creates the release.
- Do not add automatic version bumping or automatic tag creation in this pass; match the existing CLI workflow.
- Keep CLI and desktop on the same version and same GitHub release.
- Ship macOS desktop assets only for now.
- Publish `.dmg` and `.zip` installers; do not include `.blockmap` artifacts in the release.
- Do not block the first release on Apple signing or notarization.

## Implementation
1. Extend the existing release workflow into a shared CLI + desktop release workflow.
- Update `.github/workflows/release.yml` so it still runs on pushed `v*` tags.
- Keep the current CLI build job intact.
- Add a desktop build job on `macos-latest` that installs Bun deps, sets up `uv`, builds the packaged CLI runtime, and packages the Electron app.
- Keep one publish job that downloads all build artifacts and creates a single GitHub release.

2. Validate desktop version alignment with the release tag.
- Add a workflow step that checks `apps/desktop/package.json` version against `GITHUB_REF_NAME`.
- Keep the existing CLI version check for `apps/rmbg`.
- Fail fast when the shared tag does not match both app versions.

3. Make desktop packaging reproducible in CI.
- Use the existing desktop packaging scripts rather than introducing a second build path.
- Ensure the desktop workflow stages the packaged `rmbg` runtime before invoking `electron-builder`.
- Verify the packaged app includes the runtime under app resources so the installed app works outside the monorepo.

4. Normalize desktop release asset names.
- Configure `electron-builder` output naming so release files are predictable and versioned.
- Target asset names:
  - `local-background-remover-vX.Y.Z-darwin-arm64.dmg`
  - `local-background-remover-vX.Y.Z-darwin-arm64.zip`
- Keep the existing CLI asset naming unchanged.

5. Publish combined release checksums.
- Regenerate `checksums.txt` during the publish job after downloading CLI and desktop artifacts.
- Include both CLI archives and desktop installer assets in the checksum file.

6. Document the release flow.
- Update `apps/desktop/README.md` with the shared-tag release steps.
- Update `DEPLOYMENT_RUNBOOK.md` with expected desktop release assets and the unsigned-installer caveat.
- Document that App Store submission is not required for GitHub-hosted `.dmg` releases.

## Expected Release Assets
- `rmbg-vX.Y.Z-darwin-arm64.tar.gz`
- `local-background-remover-vX.Y.Z-darwin-arm64.dmg`
- `local-background-remover-vX.Y.Z-darwin-arm64.zip`
- `checksums.txt`

## Files To Modify
- `.github/workflows/release.yml`
  - Add desktop build steps and unified artifact publishing.
- `apps/desktop/package.json`
  - Ensure the CI-facing packaging command is complete and stable.
- `apps/desktop/electron-builder.yml`
  - Add deterministic artifact naming for release assets.
- `apps/desktop/scripts/dist-mac.mjs`
  - Keep CI packaging behavior aligned with local packaging, including unsigned builds by default when signing secrets are absent.
- `apps/desktop/README.md`
  - Document desktop release steps and output artifacts.
- `DEPLOYMENT_RUNBOOK.md`
  - Document the shared CLI + desktop release process and verification steps.

## Risks
- Unsigned installers will be the fastest path to public testing, but macOS will show stronger security warnings than a notarized build.
- Shared release tags require CLI and desktop versions to stay aligned on every release.
- `macos-latest` GitHub runners currently build arm64 desktop artifacts only within the existing packaging assumptions.
- Release asset naming must be stable so docs and any later download links do not drift.

## Verification
1. `cd apps/rmbg && bun run package:mac`
2. `cd apps/desktop && bun run dist:mac`
3. Confirm local desktop artifacts are emitted with the normalized release names.
4. Push a test tag `vX.Y.Z` and wait for the GitHub release workflow to finish.
5. Confirm the GitHub release contains:
- `rmbg-vX.Y.Z-darwin-arm64.tar.gz`
- `local-background-remover-vX.Y.Z-darwin-arm64.dmg`
- `local-background-remover-vX.Y.Z-darwin-arm64.zip`
- `checksums.txt`
6. Download the desktop `.dmg` from the GitHub release on a clean macOS machine and verify the app launches.
7. Verify the installed app can locate its bundled runtime and perform a basic end-to-end processing flow.

## Optional Follow-Up
- Extend `apps/web` so `/downloads` links directly to the desktop GitHub release asset.
- Add Apple signing and notarization secrets later to remove the unsigned-app install friction.
