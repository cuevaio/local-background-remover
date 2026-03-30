# Local Background Remover Web

Marketing site + checkout + license validation service.

Public installer URL:

- `https://local.backgroundrm.com/install`

Downloads are public, but runtime use is license-gated through `/api/license/*`.

## Run

From repository root:

```bash
bun run dev:web
```

## Required env vars

Use root `.env.example` as reference.

- `POLAR_ACCESS_TOKEN`
- `POLAR_ORGANIZATION_ID`
- `POLAR_PRODUCT_APP_ID`
- `POLAR_PRODUCT_CLI_ID`
- `POLAR_PRODUCT_BOTH_ID`
- `POLAR_BENEFIT_CLI_ID`
- `POLAR_BENEFIT_DESKTOP_ID`
- `LICENSE_SIGNING_PRIVATE_KEY`

Optional override:

- `RMBG_LATEST_VERSION` (if omitted, `/api/releases/latest` resolves latest from GitHub releases)

## Product model

- `app`: includes app/desktop key
- `cli`: includes CLI key
- `both`: includes two keys (app + cli)
