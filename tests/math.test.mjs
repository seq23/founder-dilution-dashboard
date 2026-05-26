import assert from 'node:assert/strict';
import { DEFAULT_EXAMPLES, cloneExample, findDefaultExample } from '../src/scenarios.js';
import { calculateSaleOutcome, firstDollarToFounder, firstSalePriceForFounderTarget, investorOwnershipForRound, ownershipAfterRounds, paybackClaim, validateOwnership } from '../src/math.js';

function nearly(actual, expected, tolerance = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

{
  const round = { invested: 2000000, companyValueBeforeInvestment: 8000000 };
  nearly(investorOwnershipForRound(round), 0.2);
}

{
  const scenario = cloneExample(findDefaultExample('clean-seed'));
  const snapshot = ownershipAfterRounds(scenario.startingOwnership, scenario.rounds);
  nearly(snapshot.founder, 0.624);
}

{
  const check = validateOwnership({ founder: 60, team: 10, employeePool: 15, existingInvestors: 15, other: 0 });
  assert.equal(check.ok, true);
}

{
  const security = { invested: 10000000, investorPaybackMultiple: 1, paybackGrows: true, annualGrowthRate: 0.08, yearsSinceInvestment: 3 };
  assert.equal(paybackClaim(security), 12400000);
}

{
  const scenario = cloneExample(findDefaultExample('founder-zero'));
  const outcome = calculateSaleOutcome(scenario, 40000000);
  assert.equal(outcome.founderPayout, 0);
  assert.ok(outcome.headline.includes('receive $0'));
}

{
  const scenario = cloneExample(findDefaultExample('investor-paid-twice'));
  const outcome = calculateSaleOutcome(scenario, 100000000);
  const payment = outcome.investorPayments[0];
  assert.ok(payment.extraPayment > 0, 'participating investor should receive extra payment after payback');
  assert.ok(payment.totalPayment > payment.preferencePayment, 'total should include payback plus extra payment');
}

{
  const scenario = cloneExample(findDefaultExample('investor-paid-twice'));
  const outcome = calculateSaleOutcome(scenario, 1000000000);
  const payment = outcome.investorPayments[0];
  assert.ok(payment.totalPayment <= 30000000 + 1, '3x cap should limit payout on a $10M investment');
}

{
  const scenario = cloneExample(findDefaultExample('debt-before-equity'));
  const outcome = calculateSaleOutcome(scenario, 25000000);
  assert.equal(outcome.netMoney, 4000000);
}

{
  const scenario = cloneExample(findDefaultExample('sale-price-needed'));
  const firstDollar = firstDollarToFounder(scenario);
  const oneMillion = firstSalePriceForFounderTarget(scenario, 1000000);
  assert.ok(firstDollar > 0);
  assert.ok(oneMillion > firstDollar);
  const outcome = calculateSaleOutcome(scenario, oneMillion);
  assert.ok(outcome.founderPayout >= 999999);
}

{
  assert.ok(DEFAULT_EXAMPLES.length >= 7, 'should ship with a broad example library');
}

console.log('Math tests passed.');

{
  const scenario = cloneExample(findDefaultExample('clean-seed'));
  const highOutcome = calculateSaleOutcome(scenario, 1000000000);
  const seedPayment = highOutcome.investorPayments.find((payment) => payment.id === 'seed');
  assert.equal(seedPayment.choice, 'shares instead of payback', 'clean non-participating investor should convert when shares pay more than 1x payback');
  assert.ok(seedPayment.totalPayment > 2000000, 'converted investor should receive more than the 1x payback at a large exit');
}

{
  const scenario = cloneExample(findDefaultExample('heavy-vc-stack'));
  const lowOutcome = calculateSaleOutcome(scenario, 25000000);
  const firstPaid = lowOutcome.investorPayments.find((payment) => payment.name === 'Series C');
  assert.ok(firstPaid.totalPayment > 0, 'senior Series C should be paid first when proceeds are limited');
  assert.equal(lowOutcome.founderPayout, 0, 'founder should receive zero when senior stack consumes limited proceeds');
}
