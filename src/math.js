const EPSILON = 0.01;

export function currency(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function pct(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${amount.toFixed(1)}%`;
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function ownershipTotal(ownership) {
  return Object.values(ownership).reduce((sum, value) => sum + safeNumber(value), 0);
}

export function validateOwnership(ownership) {
  const total = ownershipTotal(ownership);
  return {
    total,
    ok: Math.abs(total - 100) <= EPSILON,
    message: Math.abs(total - 100) <= EPSILON
      ? 'These ownership numbers add up clearly.'
      : 'These ownership numbers need to add up to 100% before the dashboard can explain the outcome clearly.'
  };
}

export function investorOwnershipForRound(round) {
  const invested = Math.max(0, safeNumber(round.invested));
  const before = Math.max(0, safeNumber(round.companyValueBeforeInvestment));
  const after = invested + before;
  if (after <= 0) return 0;
  return invested / after;
}

export function ownershipAfterRounds(startingOwnership, rounds) {
  let founder = safeNumber(startingOwnership.founder) / 100;
  let team = safeNumber(startingOwnership.team) / 100;
  let employeePool = safeNumber(startingOwnership.employeePool) / 100;
  let existingInvestors = safeNumber(startingOwnership.existingInvestors) / 100;
  let other = safeNumber(startingOwnership.other) / 100;
  const investorClasses = [];
  const rows = [];

  for (const round of rounds) {
    const newInvestorShare = investorOwnershipForRound(round);
    const dilutionFactor = 1 - newInvestorShare;
    founder *= dilutionFactor;
    team *= dilutionFactor;
    employeePool *= dilutionFactor;
    existingInvestors *= dilutionFactor;
    other *= dilutionFactor;
    for (const security of investorClasses) {
      security.ownership *= dilutionFactor;
    }
    investorClasses.push({
      id: round.id,
      name: round.name,
      invested: Math.max(0, safeNumber(round.invested)),
      ownership: newInvestorShare,
      investorPaybackMultiple: Math.max(0, safeNumber(round.investorPaybackMultiple, 1)),
      paidBefore: safeNumber(round.paidBefore, 1),
      getsPaidTwice: Boolean(round.getsPaidTwice),
      payoutCapMultiple: Math.max(0, safeNumber(round.payoutCapMultiple, 0)),
      paybackGrows: Boolean(round.paybackGrows),
      annualGrowthRate: Math.max(0, safeNumber(round.annualGrowthRate, 0)),
      yearsSinceInvestment: Math.max(0, safeNumber(round.yearsSinceInvestment, 0))
    });
    rows.push({
      roundName: round.name,
      founder: founder * 100,
      team: team * 100,
      employeePool: employeePool * 100,
      existingInvestors: existingInvestors * 100,
      newInvestor: newInvestorShare * 100,
      totalPreferred: investorClasses.reduce((sum, security) => sum + security.ownership, 0) * 100
    });
  }

  return {
    founder,
    team,
    employeePool,
    existingInvestors,
    other,
    investorClasses,
    rows
  };
}

export function paybackClaim(security) {
  const invested = Math.max(0, safeNumber(security.invested));
  const multiple = Math.max(0, safeNumber(security.investorPaybackMultiple, 1));
  const growth = security.paybackGrows
    ? invested * Math.max(0, safeNumber(security.annualGrowthRate)) * Math.max(0, safeNumber(security.yearsSinceInvestment))
    : 0;
  return invested * multiple + growth;
}

export function netMoneyFromSale(salePrice, saleCosts) {
  return Math.max(0,
    Math.max(0, safeNumber(salePrice))
    - Math.max(0, safeNumber(saleCosts.debt))
    - Math.max(0, safeNumber(saleCosts.fees))
    - Math.max(0, safeNumber(saleCosts.holdback))
    - Math.max(0, safeNumber(saleCosts.other))
  );
}

function commonPoolOwnership(snapshot) {
  return snapshot.founder + snapshot.team + snapshot.employeePool + snapshot.existingInvestors + snapshot.other;
}

function allChoicesForNonParticipating(investorClasses) {
  const nonParticipating = investorClasses.filter((security) => !security.getsPaidTwice);
  const count = nonParticipating.length;
  const total = 2 ** count;
  const choices = [];
  for (let mask = 0; mask < total; mask += 1) {
    const convertIds = new Set();
    for (let i = 0; i < count; i += 1) {
      if (mask & (1 << i)) convertIds.add(nonParticipating[i].id);
    }
    choices.push(convertIds);
  }
  return choices;
}

function allocateResidual({ residual, snapshot, investorPayments, convertedInvestors }) {
  const recipients = [
    { id: 'founder', name: 'Founder', ownership: snapshot.founder, cap: Infinity, received: 0, kind: 'founder' },
    { id: 'team', name: 'Co-founder / team', ownership: snapshot.team, cap: Infinity, received: 0, kind: 'common' },
    { id: 'employeePool', name: 'Employee share pool', ownership: snapshot.employeePool, cap: Infinity, received: 0, kind: 'common' },
    { id: 'existingInvestors', name: 'Existing investors', ownership: snapshot.existingInvestors, cap: Infinity, received: 0, kind: 'common' },
    { id: 'other', name: 'Other', ownership: snapshot.other, cap: Infinity, received: 0, kind: 'common' }
  ];

  for (const security of convertedInvestors) {
    recipients.push({
      id: security.id,
      name: security.name,
      ownership: security.ownership,
      cap: Infinity,
      received: 0,
      kind: 'convertedInvestor'
    });
  }

  for (const payment of investorPayments.filter((entry) => entry.getsPaidTwice)) {
    const capTotal = payment.payoutCapMultiple > 0 ? payment.payoutCapMultiple * payment.invested : Infinity;
    recipients.push({
      id: payment.id,
      name: payment.name,
      ownership: payment.ownership,
      cap: Math.max(0, capTotal - payment.totalPayment),
      received: 0,
      kind: 'participatingInvestor'
    });
  }

  let remaining = Math.max(0, residual);
  const active = () => recipients.filter((recipient) => recipient.ownership > 0 && recipient.received < recipient.cap - EPSILON);
  let guard = 0;

  while (remaining > EPSILON && active().length > 0 && guard < 100) {
    guard += 1;
    const current = active();
    const totalOwnership = current.reduce((sum, recipient) => sum + recipient.ownership, 0);
    if (totalOwnership <= 0) break;
    let distributedThisPass = 0;
    for (const recipient of current) {
      const proposed = remaining * (recipient.ownership / totalOwnership);
      const allowed = Math.max(0, Math.min(proposed, recipient.cap - recipient.received));
      recipient.received += allowed;
      distributedThisPass += allowed;
    }
    remaining -= distributedThisPass;
    if (distributedThisPass <= EPSILON) break;
  }

  for (const recipient of recipients.filter((entry) => entry.kind === 'participatingInvestor')) {
    const payment = investorPayments.find((entry) => entry.id === recipient.id);
    payment.extraPayment = recipient.received;
    payment.totalPayment += recipient.received;
  }

  for (const recipient of recipients.filter((entry) => entry.kind === 'convertedInvestor')) {
    const payment = investorPayments.find((entry) => entry.id === recipient.id);
    payment.extraPayment = recipient.received;
    payment.totalPayment += recipient.received;
  }

  const founderPayout = recipients.find((entry) => entry.id === 'founder')?.received || 0;
  const teamAndOtherCommonPayout = recipients
    .filter((entry) => ['common'].includes(entry.kind))
    .reduce((sum, recipient) => sum + recipient.received, 0);
  const convertedInvestorPayout = recipients
    .filter((entry) => entry.kind === 'convertedInvestor')
    .reduce((sum, recipient) => sum + recipient.received, 0);
  const commonProceeds = recipients
    .filter((entry) => ['founder', 'common'].includes(entry.kind))
    .reduce((sum, recipient) => sum + recipient.received, 0);

  return {
    founderPayout,
    teamAndOtherCommonPayout,
    convertedInvestorPayout,
    commonProceeds,
    unallocatedResidual: Math.max(0, remaining),
    residualRecipients: recipients
  };
}

function evaluateChoice(snapshot, netMoney, convertIds) {
  const investorPayments = [];
  const convertedInvestors = [];
  let remaining = Math.max(0, netMoney);

  for (const security of snapshot.investorClasses) {
    if (convertIds.has(security.id) && !security.getsPaidTwice) {
      convertedInvestors.push(security);
      investorPayments.push({
        id: security.id,
        name: security.name,
        invested: security.invested,
        ownership: security.ownership,
        claim: paybackClaim(security),
        preferencePayment: 0,
        extraPayment: 0,
        totalPayment: 0,
        getsPaidTwice: false,
        payoutCapMultiple: security.payoutCapMultiple,
        choice: 'shares instead of payback'
      });
    } else {
      investorPayments.push({
        id: security.id,
        name: security.name,
        invested: security.invested,
        ownership: security.ownership,
        claim: paybackClaim(security),
        preferencePayment: 0,
        extraPayment: 0,
        totalPayment: 0,
        getsPaidTwice: security.getsPaidTwice,
        payoutCapMultiple: security.payoutCapMultiple,
        paidBefore: security.paidBefore,
        choice: security.getsPaidTwice ? 'payback plus remaining proceeds' : 'payback right'
      });
    }
  }

  const preferencePayments = investorPayments
    .filter((payment) => payment.choice !== 'shares instead of payback')
    .sort((a, b) => a.paidBefore - b.paidBefore);
  const seniorityGroups = [...new Set(preferencePayments.map((payment) => payment.paidBefore))].sort((a, b) => a - b);

  for (const rank of seniorityGroups) {
    const group = preferencePayments.filter((payment) => payment.paidBefore === rank);
    const totalClaim = group.reduce((sum, payment) => sum + payment.claim, 0);
    const availableForGroup = Math.min(remaining, totalClaim);
    for (const payment of group) {
      const preferencePayment = totalClaim > 0 ? availableForGroup * (payment.claim / totalClaim) : 0;
      payment.preferencePayment = preferencePayment;
      payment.totalPayment = preferencePayment;
    }
    remaining -= availableForGroup;
    if (remaining <= EPSILON) break;
  }

  const residual = allocateResidual({ residual: remaining, snapshot, investorPayments, convertedInvestors });
  const totalInvestorPayout = investorPayments.reduce((sum, payment) => sum + payment.totalPayment, 0);
  const nonParticipatingPayout = investorPayments
    .filter((payment) => !payment.getsPaidTwice)
    .reduce((map, payment) => ({ ...map, [payment.id]: payment.totalPayment }), {});

  return {
    investorPayments,
    convertedInvestors,
    founderPayout: residual.founderPayout,
    teamAndOtherCommonPayout: residual.teamAndOtherCommonPayout,
    commonProceeds: residual.commonProceeds,
    unallocatedResidual: residual.unallocatedResidual,
    residualRecipients: residual.residualRecipients,
    totalInvestorPayout,
    nonParticipatingPayout
  };
}

function selectInvestorFavorableChoice(snapshot, netMoney) {
  const choices = allChoicesForNonParticipating(snapshot.investorClasses);
  const evaluated = choices.map((convertIds) => ({ convertIds, result: evaluateChoice(snapshot, netMoney, convertIds) }));
  evaluated.sort((a, b) => {
    const investorDelta = b.result.totalInvestorPayout - a.result.totalInvestorPayout;
    if (Math.abs(investorDelta) > EPSILON) return investorDelta;
    return a.result.founderPayout - b.result.founderPayout;
  });
  return evaluated[0]?.result || evaluateChoice(snapshot, netMoney, new Set());
}

export function calculateSaleOutcome(scenario, salePrice) {
  const ownershipCheck = validateOwnership(scenario.startingOwnership);
  const snapshot = ownershipAfterRounds(scenario.startingOwnership, scenario.rounds);
  const netMoney = netMoneyFromSale(salePrice, scenario.saleCosts);
  const result = selectInvestorFavorableChoice(snapshot, netMoney);

  const founderPayout = result.founderPayout;
  const totalInvestorPayout = result.totalInvestorPayout;
  const commonProceeds = result.commonProceeds;
  const teamAndOtherCommonPayout = result.teamAndOtherCommonPayout;
  const investorPayments = result.investorPayments;

  const headline = founderPayout <= EPSILON
    ? `You may own ${pct(snapshot.founder * 100)} of the company, but in this scenario founder/team shares receive $0 because the investor payback stack is larger than the money available.`
    : `Founder/team shares receive money in this scenario. The estimated founder payout is ${currency(founderPayout)}.`;

  return {
    ownershipCheck,
    salePrice: safeNumber(salePrice),
    netMoney,
    snapshot,
    investorPayments,
    convertedInvestors: result.convertedInvestors,
    residualRecipients: result.residualRecipients,
    commonProceeds,
    founderPayout,
    teamAndOtherCommonPayout,
    totalInvestorPayout,
    headline
  };
}

export function firstSalePriceForFounderTarget(scenario, target) {
  const cleanTarget = Math.max(0, safeNumber(target));
  if (cleanTarget === 0) return 0;
  let low = 0;
  let high = 1000000;
  let guard = 0;
  while (calculateSaleOutcome(scenario, high).founderPayout < cleanTarget && guard < 60) {
    high *= 2;
    guard += 1;
  }
  if (guard >= 60) return Infinity;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    if (calculateSaleOutcome(scenario, mid).founderPayout >= cleanTarget) high = mid;
    else low = mid;
  }
  return high;
}

export function firstDollarToFounder(scenario) {
  return firstSalePriceForFounderTarget(scenario, 1);
}

export function summarizeScenario(scenario) {
  const lastSalePrice = scenario.salePrices[Math.min(2, scenario.salePrices.length - 1)] || 0;
  const outcome = calculateSaleOutcome(scenario, lastSalePrice);
  return {
    founderOwnership: outcome.snapshot.founder * 100,
    investorPaybackStack: outcome.investorPayments.reduce((sum, payment) => sum + payment.claim, 0),
    firstDollar: firstDollarToFounder(scenario),
    oneMillion: firstSalePriceForFounderTarget(scenario, 1000000),
    founderPayoutAtSample: outcome.founderPayout
  };
}
