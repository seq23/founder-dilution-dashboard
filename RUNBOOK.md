# RUNBOOK — founder-dilution-dashboard

Read this before changing anything. It is the file an AI employee (Porter in West Peek OS,
Danielle in Boss OS) reads at plan time; `scripts/validate-runbook.mjs` fails the build if the
paths and scripts named here stop existing.

## What this repo is
**Founder Dilution Dashboard by West Peek** — a static, no-login browser tool that shows tech
founders ownership dilution, investor payback order, and the sale price needed before they are paid.
Partners call it "the dilution dashboard", "the dilution calculator", "the dilution site" or
"founder dilution". westpeek.ventures links to it as its one allowed sister host.

| | |
|---|---|
| Hosting | Cloudflare **Pages** project `founder-dilution-dashboard` (not a Worker) |
| Public host | https://dilution.joinwestpeek.com (custom domain) and founder-dilution-dashboard.pages.dev |
| Source | `src/` (page, styles, math, scenarios, UI) and `public/` (robots, sitemap, brand) |
| Build | `npm run build` (`scripts/build.mjs`) copies `src/` then `public/` into `dist/` (git-ignored) |
| Edge | `functions/_middleware.js` — adds `X-Robots-Tag: noindex` on `*.pages.dev` only |

Key files: `src/math.js` (all founder money math), `src/scenarios.js` (built-in examples),
`src/app.js` (the guided UI), `src/index.html` (title, canonical), `public/sitemap.xml`,
`public/robots.txt`. No env vars, no backend, no secrets (`ENVIRONMENT_VARIABLES.md`).

## Standing rules (from this repo's own docs and validators)
- **Saved scenarios are temporary** — page-lifetime only, never browser storage
  (`REPO_IDENTITY.md`). Guards: `tests/session-behavior.test.mjs`; `scripts/validate-ui-copy.mjs`
  forbids `localStorage`/`sessionStorage` in `src/`.
- **Built-in examples are immutable**; edits work on copies and reset restores the original.
  Guard: `tests/presets.test.mjs`.
- **Founder money math is the product.** Any change to `src/math.js` needs a matching case in
  `tests/math.test.mjs`; never loosen an expected number to make a test pass.
- **Founder-facing plain English only.** Internal words (backend, schema, payload, NaN, …) may
  not appear in `src/index.html`, `src/app.js`, `src/scenarios.js`, and the required warnings
  ("Educational scenario simulator only.", "Your saved scenarios are temporary.", …) must stay.
  The list lives in `scripts/validate-ui-copy.mjs`; language guidance in `docs/BRAND_GUIDE.md`.
- **West Peek brand**: palette and logo usage in `docs/BRAND_GUIDE.md`; the logo
  `public/brand/wp-logo.png` must exist (alt text "West Peek logo").
- **The noindex header is for `*.pages.dev` only** — it must never reach
  dilution.joinwestpeek.com (`functions/_middleware.js`). The canonical in `src/index.html`
  points at https://dilution.joinwestpeek.com/.
- **Decisions an employee must ask, not make**: brand or colourway, copy meaning, the educational
  disclaimer or any legal wording, what the math models, anything about money. Layout, CSS,
  tests, validators: decide, record on the card, keep going.
- Scope and validation contract: `REPO_VALIDATION_MATRIX.md`, `docs/PRODUCT_SPEC.md`.

## How to make a change
1. Branch `work/<slug>` off `origin/main` (in a worktree; never the owner's checkout).
2. Edit under `src/` or `public/`. No `npm install` needed — there are no dependencies.
3. Validate — all must pass:
   - `npm run test:unit` (math, presets, temporary saves, UI copy + brand)
   - `npm run build`
   - `npm run validate:runbook`
   - `npm run validate:workflows` (the browser journey stays nightly, production moves only by promote)
   - `npm run test:e2e` (Playwright browser journey) ONLY if your change touches what it covers —
     in CI it runs nightly, not per merge (see "How it deploys"). Zero setup: `scripts/e2e.mjs`
     creates a git-ignored `.venv/` with the `python3` on PATH, installs the `playwright` pin from
     `requirements-e2e.txt`, installs Playwright's Chromium once, then runs
     `scripts/run-playwright-e2e.py`. Never `pip install` into the system Python. To rebuild:
     `rm -rf .venv`. Overrides: `E2E_PYTHON` (interpreter), `CHROMIUM_PATH` (browser binary),
     `E2E_INSTALL_DEPS=1` (Linux only: also apt-install Chromium's libraries; CI sets it).
     `npm run validate:all` runs everything.
4. Look at it: `npm run serve`, check desktop and 390px width.
5. Commit, push, open a PR. CI (`.github/workflows/validate.yml`) runs the same fast gate; Cloudflare
   Pages comments a preview on the PR: `https://<hash>.founder-dilution-dashboard.pages.dev`
   and the branch alias `https://<branch-slug>.founder-dilution-dashboard.pages.dev`.
6. `~/bin/land <pr>` verifies green, squash-merges, watches `main`.
7. Prove it on staging: `curl -s https://main.founder-dilution-dashboard.pages.dev/ | grep <your change>`.
   Production follows after the nightly browser journey (below).

## How it deploys (build first, test in batches — 26 Sep 2026)
- **Staging = `main`.** Cloudflare Pages Git integration builds every push to `main` (`npm run build`,
  output `dist/`) as the preview https://main.founder-dilution-dashboard.pages.dev.
- **Production = the `production` branch** (dilution.joinwestpeek.com). Only `.github/workflows/promote.yml`
  moves it, and only to a sha the browser journey passed: `.github/workflows/e2e.yml` runs nightly
  (07:20 UTC) and on dispatch; on success promote fast-forwards `production` to that sha.
- **Promote by hand**: `gh workflow run e2e.yml --ref main` (runs the journey on main's head; green →
  promote fires), or `gh workflow run promote.yml -f sha=<sha>` for a sha that already has a green run.
- A red nightly leaves production where it is; fix main first. Never `wrangler pages deploy` from a laptop.

## Guards, and what each pins
| Script | Pins |
|---|---|
| `tests/math.test.mjs` | dilution, payback order, pari passu, paid-twice, caps, founder-$0, target sale price |
| `tests/presets.test.mjs` | built-in examples stay immutable and reset cleanly |
| `tests/session-behavior.test.mjs` | saved scenarios are page-lifetime only |
| `scripts/validate-ui-copy.mjs` | no internal language in UI copy; required warnings; logo present |
| `scripts/run-playwright-e2e.py` | the real founder journey in a browser, desktop and mobile |
| `scripts/e2e.mjs` | `npm run test:e2e` bootstraps its own `.venv/` and Chromium from `requirements-e2e.txt`; no system Python setup |
| `scripts/validate-runbook.mjs` | this file names real paths and scripts |
| `scripts/validate-workflows.mjs` | `validate.yml` never runs the browser journey; `e2e.yml` is schedule + dispatch only, with a ceiling; `promote.yml` moves `production` only on e2e success |
| `.github/workflows/validate.yml` | the merge gate: unit, build, runbook and workflow guards on every PR and on `main` (~1 min) |
| `.github/workflows/e2e.yml` | the browser journey, nightly 07:20 UTC + dispatch — gates production, never the merge |
| `.github/workflows/promote.yml` | fast-forwards `production` to the e2e-green sha (auto on e2e success; by hand with a sha that has one) |

Prove a new guard negatively before merging: plant the defect, watch it fail, remove it.
