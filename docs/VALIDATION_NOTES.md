# Validation Notes

Validation target: Founder Dilution Dashboard by West Peek branding pass.

Validated locally in this artifact environment:

- `npm run validate:all`

This includes:

- founder money math tests
- immutable/resettable example tests
- temporary saved scenario tests
- founder-facing copy and brand checks
- anti-theatre Playwright E2E
- static build

The Playwright E2E covers:

- branded surface: WP logo and product title
- founder guided flow
- editing sale price, debt, target payout, and round terms
- proving founder can own shares and receive $0
- proving first-dollar threshold is calculated
- proving investor-paid-twice changes actual payout
- adding/removing a funding round
- saving a temporary scenario
- preserving that saved scenario while page remains open
- resetting back to the original example
- clearing saved scenarios
- proving saved scenario disappears after reload
- mobile usability smoke
- desktop and mobile screenshots

Unproven:

- deployed smoke
- GitHub Actions status
- production hosting behavior
