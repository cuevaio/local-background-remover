# CLI Docs Web Refresh Plan

## Objective
- Improve `apps/web` with clear CLI onboarding docs covering install, activation, usage, commands, and practical references.
- Make command snippets easier to execute by adding one-click copy actions.
- Keep messaging focused on paid CLI usage and avoid confusing optional setup details.

## Scope
- Add a dedicated docs route at `/docs` with SEO metadata and JSON-LD.
- Reuse centralized CLI command strings across web pages.
- Update homepage, downloads, pricing, thank-you, header nav, footer, sitemap, and robots to surface docs.
- Follow-up UX refinements from feedback:
  - stack docs sections in a single column for readability
  - add copy buttons to every command block
  - remove environment-variable section from docs
  - keep copy focused on CLI-key activation and normal licensed usage

## Implementation
1. Added shared command/content source:
   - `apps/web/src/content/cli-docs.ts`
2. Added reusable command UI with clipboard support:
   - `apps/web/src/components/marketing/CommandBlock.tsx`
3. Added and refined docs page:
   - `apps/web/src/app/docs/page.tsx`
4. Integrated docs links and CLI quickstart across existing pages:
   - `apps/web/src/app/page.tsx`
   - `apps/web/src/app/downloads/page.tsx`
   - `apps/web/src/app/pricing/page.tsx`
   - `apps/web/src/app/thank-you/page.tsx`
   - `apps/web/src/app/layout.tsx`
   - `apps/web/src/components/marketing/SiteFooter.tsx`
5. Updated crawl/discovery:
   - `apps/web/src/app/sitemap.ts`
   - `apps/web/src/app/robots.ts`

## Verification
- Built the web app successfully:
  - `cd apps/web && bun run build`
- Web lint/test scripts are placeholders in this repo; no runnable suites beyond build verification.
