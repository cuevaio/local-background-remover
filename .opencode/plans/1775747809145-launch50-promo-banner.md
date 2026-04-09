# Launch50 Promo Banner And Polar Checkout Discount

## Goal
- Add a sticky launch-sale banner across the web app.
- Promote the `LAUNCH50` code through April 15.
- Auto-apply the matching Polar discount in checkout while still allowing discount codes in the checkout UI.

## Changes
- Add a sticky top banner in `apps/web/src/app/layout.tsx` with horizontally moving promo text.
- Add marquee animation styles in `apps/web/src/app/globals.css`.
- Centralize promo details in `apps/web/src/lib/pricing.ts`.
- Look up the Polar discount by code in `apps/web/src/lib/polar.ts`.
- Pass `discount_id` and `allow_discount_codes` when creating checkout sessions in `apps/web/src/app/api/checkout/route.ts`.
- Update pricing page copy to mention the code.
- Extend checkout route tests to cover the applied discount payload.

## Verification
- Run `cd apps/web && bun test src/app/api/checkout/route.test.ts`.
- Run `cd apps/web && bun run build`.
- Confirm the Polar discount exists with code `LAUNCH50` and expires on April 15.
