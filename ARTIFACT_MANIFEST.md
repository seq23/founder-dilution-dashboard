# Artifact Manifest

Repo: founder-dilution-dashboard
Artifact type: full baseline snapshot
Product: Founder Dilution Dashboard by West Peek
Package date: 2026-05-26

## Included surfaces

- static app source in `src/`
- West Peek logo in `public/brand/wp-logo.png`
- brand guide in `docs/BRAND_GUIDE.md`
- founder money math in `src/math.js`
- complex resettable example scenarios in `src/scenarios.js`
- plain-English step UI in `src/app.js`
- unit/behavior tests in `tests/`
- anti-theatre Playwright browser journey in `scripts/run-playwright-e2e.py`
- UI copy and brand screen in `scripts/validate-ui-copy.mjs`
- static build script in `scripts/build.mjs`
- local static server in `scripts/serve.mjs`
- repo identity document
- simplified validation matrix
- hostile compiler report
- environment contract
- validation notes
- validation log at `logs/validate-all.log`
- branding validation log at `logs/validate-all-branding.log`
- visual review screenshots in `docs/visual/`

## Validation run

Command:

`npm run validate:all`

Proof layers expected for this pass:

- founder money math tests
- immutable/resettable example tests
- temporary saved scenario tests
- founder-facing copy screen
- West Peek branding presence checks
- Playwright E2E for branded surface, transactions, outcomes, temporary scenario behavior, reset, screenshots, and mobile journey
- static build output

## Unproven layers

- deployed smoke
- GitHub Actions status
