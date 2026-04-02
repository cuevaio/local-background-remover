# Plan: SEO crawl signal fixes for web app

## Diagnosis
- Public marketing pages were appending `?exp=...` to primary internal navigation and CTA links, which exposed duplicate crawl paths for the same content.
- The sitemap was setting `lastModified` to the current build time on every deploy, which sent inaccurate freshness signals.
- The `/faq` page had crawlable content and metadata, but it did not expose FAQ structured data or breadcrumbs for richer search understanding.

## Recommended Implementation
1. Remove experiment parameters from crawlable internal links on public web pages.
- Keep experiment handling for analytics state where needed, but stop appending `exp` to standard internal navigation on indexable pages.
- Update shared CTA components so their default rendered links stay canonical.

2. Stop emitting synthetic sitemap freshness timestamps.
- Remove per-build `lastModified` values until the site can provide real content-based modification dates.

3. Add structured data to the FAQ page.
- Add `FAQPage` JSON-LD based on the rendered FAQ entries.
- Add `BreadcrumbList` JSON-LD for the FAQ route.

## Files To Modify
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/pricing/page.tsx`
- `apps/web/src/app/downloads/page.tsx`
- `apps/web/src/components/marketing/StickyCta.tsx`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/faq/page.tsx`

## Verification
1. Build the web app with `cd apps/web && bun run build`.
2. Confirm crawlable public links no longer include `?exp=` on the homepage, pricing, downloads, and sticky CTA surfaces.
3. Confirm `/faq` renders both breadcrumb and FAQ JSON-LD scripts.
4. Confirm `sitemap.xml` no longer changes solely because of build time.
