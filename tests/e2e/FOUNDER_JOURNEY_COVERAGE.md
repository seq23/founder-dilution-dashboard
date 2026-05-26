# Founder Journey E2E Coverage

Authoritative E2E harness: `scripts/run-playwright-e2e.py`

Coverage requirements:

- Surface: guided eight-step founder flow and warnings are visible.
- Transactions: editable sale price, debt, target payout, round changes, and investor-payback settings change real results.
- Outcomes: founder can own shares and receive `$0`; first-dollar threshold is calculated; high enough exit creates founder proceeds.
- Temporary saves: custom scenario exists during the active page, keeps edited values, can be reset, can be cleared, and disappears after reload.
- Mobile: key `$0` outcome journey remains usable on phone-width viewport.

Anti-theatre rule:

A passing E2E run must prove output values change after mechanisms are attempted. Label presence alone is insufficient.
