# Founder Dilution Dashboard by West Peek

A branded, plain-English dashboard for tech founders to understand ownership dilution, investor payback rights, payment order, and the sale price required before founders personally make money.

## What it does

- Starts from built-in example scenarios.
- Lets users edit every number.
- Lets users save temporary custom scenarios while the page is open.
- Lets users reset examples back to the original numbers.
- Shows who gets paid first in a company sale.
- Shows when founders can still own shares but receive $0.
- Estimates the sale price needed for founder payout targets.
- Presents the app under the West Peek brand using the WP mark, West Peek Orange, black, and white.
- Proves the key user journey with Playwright E2E.

## What it does not do

- No login.
- No remote saved scenarios.
- No permanent saved workspace.
- No legal, tax, accounting, financial, or investment advice.
- No exact modeling of every possible term sheet clause.

## Run locally

```bash
npm run serve
```

Open the shown local URL.

## Validate

```bash
npm run validate:all
```

The validation suite checks:

- founder money math
- built-in example reset behavior
- temporary saved scenario behavior
- founder-facing copy rules
- West Peek branding presence
- anti-theatre browser journey
- mobile usability smoke
- static build output

## Brand assets

- `public/brand/wp-logo.png`
- `docs/BRAND_GUIDE.md`

## Important limitation

This app is an educational scenario simulator. Real term sheets can include additional rights that change outcomes. Founders should review actual terms with qualified advisors.
