export const DEFAULT_EXAMPLES = Object.freeze([
  Object.freeze({
    id: 'clean-seed',
    name: 'Clean Seed Round',
    plainSummary: 'Simple investor payback rights, no double-dipping, and a good baseline example.',
    startingOwnership: Object.freeze({ founder: 78, team: 7, employeePool: 10, existingInvestors: 5, other: 0 }),
    saleCosts: Object.freeze({ debt: 0, fees: 500000, holdback: 0, other: 0 }),
    salePrices: Object.freeze([10000000, 25000000, 50000000, 100000000, 250000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000]),
    rounds: Object.freeze([
      Object.freeze({
        id: 'seed',
        name: 'Seed',
        invested: 2000000,
        companyValueBeforeInvestment: 8000000,
        investorPaybackMultiple: 1,
        paidBefore: 2,
        getsPaidTwice: false,
        payoutCapMultiple: 0,
        paybackGrows: false,
        annualGrowthRate: 0,
        yearsSinceInvestment: 1
      })
    ])
  }),
  Object.freeze({
    id: 'heavy-vc-stack',
    name: 'Heavy VC Stack',
    plainSummary: 'Multiple rounds where later investors are paid first, showing how founder proceeds can disappear.',
    startingOwnership: Object.freeze({ founder: 70, team: 5, employeePool: 10, existingInvestors: 15, other: 0 }),
    saleCosts: Object.freeze({ debt: 2000000, fees: 2500000, holdback: 3000000, other: 0 }),
    salePrices: Object.freeze([25000000, 50000000, 75000000, 100000000, 250000000, 500000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000]),
    rounds: Object.freeze([
      Object.freeze({ id: 'seed', name: 'Seed', invested: 2000000, companyValueBeforeInvestment: 8000000, investorPaybackMultiple: 1, paidBefore: 4, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 5 }),
      Object.freeze({ id: 'series-a', name: 'Series A', invested: 8000000, companyValueBeforeInvestment: 32000000, investorPaybackMultiple: 1, paidBefore: 3, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 3 }),
      Object.freeze({ id: 'series-b', name: 'Series B', invested: 20000000, companyValueBeforeInvestment: 60000000, investorPaybackMultiple: 1.5, paidBefore: 2, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 2 }),
      Object.freeze({ id: 'series-c', name: 'Series C', invested: 40000000, companyValueBeforeInvestment: 120000000, investorPaybackMultiple: 1, paidBefore: 1, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 1 })
    ])
  }),
  Object.freeze({
    id: 'investor-paid-twice',
    name: 'Investor Gets Paid Twice',
    plainSummary: 'Investors receive their payback first and then also share in what remains.',
    startingOwnership: Object.freeze({ founder: 72, team: 8, employeePool: 10, existingInvestors: 10, other: 0 }),
    saleCosts: Object.freeze({ debt: 0, fees: 1000000, holdback: 1000000, other: 0 }),
    salePrices: Object.freeze([10000000, 25000000, 50000000, 100000000, 250000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000]),
    rounds: Object.freeze([
      Object.freeze({ id: 'series-a', name: 'Series A', invested: 10000000, companyValueBeforeInvestment: 30000000, investorPaybackMultiple: 1, paidBefore: 1, getsPaidTwice: true, payoutCapMultiple: 3, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 2 })
    ])
  }),
  Object.freeze({
    id: 'founder-zero',
    name: 'Founder Walks Away With $0',
    plainSummary: 'Founder still owns shares, but investor payback rights consume the sale proceeds.',
    startingOwnership: Object.freeze({ founder: 65, team: 10, employeePool: 10, existingInvestors: 15, other: 0 }),
    saleCosts: Object.freeze({ debt: 3000000, fees: 2000000, holdback: 0, other: 0 }),
    salePrices: Object.freeze([20000000, 30000000, 40000000, 50000000, 75000000, 100000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000]),
    rounds: Object.freeze([
      Object.freeze({ id: 'series-a', name: 'Series A', invested: 10000000, companyValueBeforeInvestment: 25000000, investorPaybackMultiple: 1, paidBefore: 2, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 4 }),
      Object.freeze({ id: 'series-b', name: 'Series B', invested: 20000000, companyValueBeforeInvestment: 50000000, investorPaybackMultiple: 2, paidBefore: 1, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 2 })
    ])
  }),
  Object.freeze({
    id: 'sale-price-needed',
    name: 'What Sale Price Do I Need?',
    plainSummary: 'Choose a personal payout target and see the company sale price required to reach it.',
    startingOwnership: Object.freeze({ founder: 60, team: 10, employeePool: 15, existingInvestors: 15, other: 0 }),
    saleCosts: Object.freeze({ debt: 1000000, fees: 2500000, holdback: 2000000, other: 0 }),
    salePrices: Object.freeze([25000000, 50000000, 100000000, 250000000, 500000000, 1000000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000, 25000000]),
    rounds: Object.freeze([
      Object.freeze({ id: 'seed', name: 'Seed', invested: 2000000, companyValueBeforeInvestment: 10000000, investorPaybackMultiple: 1, paidBefore: 3, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 5 }),
      Object.freeze({ id: 'series-a', name: 'Series A', invested: 8000000, companyValueBeforeInvestment: 32000000, investorPaybackMultiple: 1, paidBefore: 2, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: true, annualGrowthRate: 0.08, yearsSinceInvestment: 3 }),
      Object.freeze({ id: 'series-b', name: 'Series B', invested: 25000000, companyValueBeforeInvestment: 85000000, investorPaybackMultiple: 1, paidBefore: 1, getsPaidTwice: true, payoutCapMultiple: 2, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 1 })
    ])
  }),
  Object.freeze({
    id: 'down-round-warning',
    name: 'Down Round Pressure',
    plainSummary: 'A lower-priced round can make earlier investor protections more painful for founders.',
    startingOwnership: Object.freeze({ founder: 62, team: 8, employeePool: 15, existingInvestors: 15, other: 0 }),
    saleCosts: Object.freeze({ debt: 1500000, fees: 1500000, holdback: 0, other: 0 }),
    salePrices: Object.freeze([25000000, 50000000, 75000000, 100000000, 250000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000]),
    rounds: Object.freeze([
      Object.freeze({ id: 'series-a', name: 'Series A', invested: 12000000, companyValueBeforeInvestment: 48000000, investorPaybackMultiple: 1, paidBefore: 2, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 3 }),
      Object.freeze({ id: 'series-b-down', name: 'Series B Down Round', invested: 15000000, companyValueBeforeInvestment: 30000000, investorPaybackMultiple: 1.5, paidBefore: 1, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 1 })
    ])
  }),
  Object.freeze({
    id: 'debt-before-equity',
    name: 'Debt Before Equity',
    plainSummary: 'Shows how debt, fees, and holdbacks reduce what is available to everyone else.',
    startingOwnership: Object.freeze({ founder: 68, team: 7, employeePool: 10, existingInvestors: 15, other: 0 }),
    saleCosts: Object.freeze({ debt: 12000000, fees: 3000000, holdback: 5000000, other: 1000000 }),
    salePrices: Object.freeze([25000000, 50000000, 75000000, 100000000, 250000000]),
    founderTargets: Object.freeze([100000, 1000000, 5000000, 10000000]),
    rounds: Object.freeze([
      Object.freeze({ id: 'series-a', name: 'Series A', invested: 8000000, companyValueBeforeInvestment: 32000000, investorPaybackMultiple: 1, paidBefore: 1, getsPaidTwice: false, payoutCapMultiple: 0, paybackGrows: false, annualGrowthRate: 0, yearsSinceInvestment: 2 })
    ])
  })
]);

export function cloneExample(example) {
  return JSON.parse(JSON.stringify(example));
}

export function findDefaultExample(id) {
  return DEFAULT_EXAMPLES.find((example) => example.id === id);
}
