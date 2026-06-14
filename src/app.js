import { DEFAULT_EXAMPLES, cloneExample, findDefaultExample } from './scenarios.js';
import { calculateSaleOutcome, currency, firstDollarToFounder, firstSalePriceForFounderTarget, ownershipAfterRounds, pct, summarizeScenario, validateOwnership } from './math.js';

const app = document.querySelector('#app');
let activeScenario = cloneExample(DEFAULT_EXAMPLES[0]);
let savedScenarios = [];
let selectedSalePrice = activeScenario.salePrices[2] || activeScenario.salePrices[0];
let selectedTarget = activeScenario.founderTargets[1] || 1000000;
let message = 'Choose an example, edit any number, and save your version while this page is open.';

function scenarioList() {
  return [...DEFAULT_EXAMPLES.map((example) => ({ ...example, temporary: false })), ...savedScenarios.map((scenario) => ({ ...scenario, temporary: true }))];
}

function numberInput(label, value, onInput, extra = '') {
  return `<label><span>${label}</span><input type="number" value="${value}" data-action="${onInput}" ${extra} /></label>`;
}

function checkbox(label, checked, action) {
  return `<label class="check"><input type="checkbox" ${checked ? 'checked' : ''} data-action="${action}" /> <span>${label}</span></label>`;
}

function render() {
  const check = validateOwnership(activeScenario.startingOwnership);
  const saleOutcome = calculateSaleOutcome(activeScenario, selectedSalePrice);
  const firstDollar = firstDollarToFounder(activeScenario);
  const targetPrice = firstSalePriceForFounderTarget(activeScenario, selectedTarget);
  const snapshot = ownershipAfterRounds(activeScenario.startingOwnership, activeScenario.rounds);
  const examples = scenarioList();

  app.innerHTML = `
    <header class="brand-header" data-testid="brand-header">
      <div class="brand-lockup">
        <img class="brand-logo" src="./brand/wp-logo.png" alt="West Peek logo" data-testid="wp-logo" />
        <div>
          <span class="brand-kicker">West Peek</span>
          <strong>Founder Dilution Dashboard by West Peek</strong>
        </div>
      </div>
      <nav class="brand-nav" aria-label="Dashboard sections">
        <a href="#dashboard" aria-current="page">Dashboard</a>
        <a href="#examples">Scenarios</a>
        <a href="#rounds">Rounds</a>
        <a href="#costs">Debt & Costs</a>
        <a href="#assumptions">Assumptions</a>
        <a href="#reports">Reports</a>
      </nav>
    </header>

    <section class="hero" id="dashboard">
      <div>
        <p class="eyebrow">Founder finance, in plain English</p>
        <h1>Founder Dilution Dashboard by West Peek</h1>
        <p class="subtitle">See how much you own, who gets paid before you, and what your company may need to sell for before you personally make money.</p>
      </div>
      <aside class="notice">
        <strong>Educational scenario simulator only.</strong>
        <span>This is not legal, tax, accounting, financial, or investment advice. Real term sheets can include additional rights that change outcomes. Use this to understand the shape of the math, then review actual terms with qualified advisors.</span>
      </aside>
    </section>

    <section class="dashboard-overview" aria-label="Current scenario summary">
      <article class="summary-card founder-summary">
        <span class="card-label">Founder outcome</span>
        <strong>${saleOutcome.founderPayout <= 0 ? 'Founder receives $0 in this scenario' : `Founder may receive ${currency(saleOutcome.founderPayout)}`}</strong>
        <p>At a ${currency(selectedSalePrice)} sale price.</p>
        <div class="soft-callout">Your first dollar appears at approximately <b>${currency(firstDollar)}</b>.</div>
      </article>
      <article class="summary-card">
        <span class="card-label">Who gets paid first</span>
        <ol class="paid-first-list">
          <li>Debts and fees</li>
          <li>Investor payback rights</li>
          <li>Payback that grows over time</li>
          <li>Transaction costs</li>
          <li>Founder/team shares</li>
        </ol>
        <p class="mini-note">This is the payment order.</p>
      </article>
      <article class="summary-card threshold-summary">
        <span class="card-label">Sale price needed before you make money</span>
        <strong>${currency(firstDollar)}</strong>
        <p>Estimated first-dollar sale price for founders.</p>
        <div class="soft-callout">Below this point, earlier claims can absorb all proceeds.</div>
      </article>
    </section>

    <section class="temporary-note">
      <strong>Your saved scenarios are temporary.</strong> They stay only while this page is open and will disappear if you refresh.
    </section>

    <section class="steps" id="examples">
      <article class="step">
        <div class="step-number">Step 1</div>
        <div class="step-body">
          <h2>Choose a starting example</h2>
          <p>Start with a common fundraising situation. You can edit every number.</p>
          <div class="scenario-grid">
            ${examples.map((example) => `
              <button class="scenario-card ${example.id === activeScenario.id ? 'active' : ''}" data-load="${example.id}" data-kind="${example.temporary ? 'saved' : 'default'}">
                <span class="scenario-type">${example.temporary ? 'My saved scenario · lost on refresh' : 'Example scenario · editable copy'}</span>
                <strong>${example.name}</strong>
                <small>${example.plainSummary}</small>
              </button>
            `).join('')}
          </div>
          <div class="button-row">
            <button data-action="save-version" data-testid="save-version">Save my version</button>
            <button data-action="reset-current" data-testid="reset-current">Reset to original example</button>
            <button data-action="clear-saved" data-testid="clear-saved">Clear my saved scenarios</button>
          </div>
          <p class="helper" data-testid="status-message">${message}</p>
        </div>
      </article>

      <article class="step">
        <div class="step-number">Step 2</div>
        <div class="step-body">
          <h2>Who owns the company before the next deal?</h2>
          <p>This is your ownership breakdown before the next financing or sale. If you are unsure, use your best estimate and label the scenario as rough.</p>
          <div class="form-grid ownership-grid">
            ${numberInput('Founder ownership %', activeScenario.startingOwnership.founder, 'ownership-founder', 'data-testid="founder-ownership-input"')}
            ${numberInput('Co-founder / team ownership %', activeScenario.startingOwnership.team, 'ownership-team')}
            ${numberInput('Employee share pool %', activeScenario.startingOwnership.employeePool, 'ownership-employeePool')}
            ${numberInput('Existing investors %', activeScenario.startingOwnership.existingInvestors, 'ownership-existingInvestors')}
            ${numberInput('Other %', activeScenario.startingOwnership.other, 'ownership-other')}
          </div>
          <p class="helper">The employee share pool is shares set aside for employees and hires. Expanding the pool often reduces founder ownership.</p>
          <p class="${check.ok ? 'good' : 'warning'}">${check.message} Current total: ${pct(check.total)}.</p>
        </div>
      </article>

      <article class="step" id="rounds">
        <div class="step-number">Step 3</div>
        <div class="step-body">
          <h2>How much money did the company raise, and on what terms?</h2>
          <p>Each investment round can change both ownership and who gets paid first in a sale.</p>
          <div class="round-list">
            ${activeScenario.rounds.map((round, index) => `
              <section class="round-card">
                <div class="round-header">
                  <h3>${round.name}</h3>
                  <button data-remove-round="${index}">Remove</button>
                </div>
                <div class="form-grid">
                  <label><span>Round name</span><input value="${round.name}" data-round-text="${index}:name" /></label>
                  ${numberInput('Money invested', round.invested, `round-${index}-invested`)}
                  ${numberInput('Company value before investment', round.companyValueBeforeInvestment, `round-${index}-companyValueBeforeInvestment`)}
                  ${numberInput('Investor payback multiple', round.investorPaybackMultiple, `round-${index}-investorPaybackMultiple`, 'step="0.1"')}
                  ${numberInput('Who gets paid first? Lower number means earlier payment', round.paidBefore, `round-${index}-paidBefore`)}
                  ${checkbox('Investor gets paid twice', round.getsPaidTwice, `round-${index}-getsPaidTwice`)}
                  ${numberInput('Payout cap multiple', round.payoutCapMultiple, `round-${index}-payoutCapMultiple`, 'step="0.1"')}
                  ${checkbox('Payback grows over time', round.paybackGrows, `round-${index}-paybackGrows`)}
                  ${numberInput('Annual growth rate', round.annualGrowthRate, `round-${index}-annualGrowthRate`, 'step="0.01"')}
                  ${numberInput('Years since investment', round.yearsSinceInvestment, `round-${index}-yearsSinceInvestment`, 'step="0.5"')}
                </div>
              </section>
            `).join('')}
          </div>
          <button data-action="add-round" data-testid="add-round">Add another funding round</button>
          <div class="notes-grid">
            <p><strong>Company value before investment:</strong> This is usually called pre-money valuation. It means what the company is valued at before the new money comes in.</p>
            <p><strong>Investor payback multiple:</strong> A 1x payback right means the investor generally gets their investment back before founder/team shares receive sale proceeds. A 2x right means they may get twice their investment back first.</p>
            <p><strong>Who gets paid first:</strong> Some later investors negotiate the right to be paid before earlier investors and founders.</p>
            <p><strong>Investor gets paid twice:</strong> The investor may get money back first and then also share in the remaining sale proceeds.</p>
          </div>
        </div>
      </article>

      <article class="step" id="costs">
        <div class="step-number">Step 4</div>
        <div class="step-body">
          <h2>What gets paid before shareholders?</h2>
          <p>The sale price is not the same thing as money available to shareholders. Debt, fees, and holdbacks usually come out first.</p>
          <div class="form-grid">
            ${numberInput('Debt to repay', activeScenario.saleCosts.debt, 'cost-debt', 'data-testid="debt-input"')}
            ${numberInput('Legal / banking / transaction fees', activeScenario.saleCosts.fees, 'cost-fees')}
            ${numberInput('Escrow or holdback', activeScenario.saleCosts.holdback, 'cost-holdback')}
            ${numberInput('Other company obligations', activeScenario.saleCosts.other, 'cost-other')}
          </div>
          <div class="equation"><span>Headline sale price</span><span>− debts and costs</span><span>= money left after costs</span></div>
        </div>
      </article>

      <article class="step" id="assumptions">
        <div class="step-number">Step 5</div>
        <div class="step-body">
          <h2>What if the company sells for different amounts?</h2>
          <p>This shows how the same ownership percentage can produce very different personal outcomes depending on the sale price and investor rights.</p>
          <div class="button-row wrap">
            ${activeScenario.salePrices.map((price) => `<button class="pill ${price === selectedSalePrice ? 'selected' : ''}" data-sale-price="${price}">${currency(price)}</button>`).join('')}
          </div>
          ${numberInput('Custom sale price', selectedSalePrice, 'selected-sale-price', 'data-testid="sale-price-input"')}
        </div>
      </article>

      <article class="step results-step">
        <div class="step-number">Step 6</div>
        <div class="step-body">
          <h2>Payment order</h2>
          <p>The payment order matters. If the money runs out before it reaches founder/team shares, founders can own a meaningful percentage and still receive $0.</p>
          <div class="payment-ladder">
            <div><strong>1</strong><span>Debts and fees</span><b>${currency(Math.max(0, selectedSalePrice - saleOutcome.netMoney))}</b></div>
            ${saleOutcome.investorPayments.map((payment, index) => `<div><strong>${index + 2}</strong><span>${payment.name} investor payback</span><b>${currency(payment.totalPayment)}</b></div>`).join('')}
            <div><strong>${saleOutcome.investorPayments.length + 2}</strong><span>Founder/team shares</span><b>${currency(saleOutcome.commonProceeds)}</b></div>
          </div>
        </div>
      </article>

      <article class="step results-step" id="reports">
        <div class="step-number">Step 7</div>
        <div class="step-body">
          <h2>What the founder may actually receive</h2>
          <div class="result-grid">
            <div class="result-card"><span>Founder ownership after rounds</span><strong data-testid="founder-ownership-result">${pct(saleOutcome.snapshot.founder * 100)}</strong></div>
            <div class="result-card"><span>Sale price tested</span><strong data-testid="sale-price-result">${currency(selectedSalePrice)}</strong></div>
            <div class="result-card"><span>Money left after costs</span><strong data-testid="net-money-result">${currency(saleOutcome.netMoney)}</strong></div>
            <div class="result-card"><span>Investor payback paid</span><strong data-testid="investor-payback-result">${currency(saleOutcome.totalInvestorPayout)}</strong></div>
            <div class="result-card"><span>Money left for founder/team shares</span><strong data-testid="common-proceeds-result">${currency(saleOutcome.commonProceeds)}</strong></div>
            <div class="result-card founder ${saleOutcome.founderPayout <= 0 ? 'danger' : 'success'}"><span>Founder estimated payout</span><strong data-testid="founder-payout-result">${currency(saleOutcome.founderPayout)}</strong></div>
          </div>
          <p class="big-warning ${saleOutcome.founderPayout <= 0 ? 'danger' : 'success'}" data-testid="founder-outcome-message">${saleOutcome.headline}</p>
          <div class="thresholds">
            <h3>Sale price needed before founder makes money</h3>
            <p>Founder first dollar appears at approximately <strong data-testid="first-dollar-result">${currency(firstDollar)}</strong>.</p>
            <label><span>Founder personal payout target</span><input type="number" value="${selectedTarget}" data-action="selected-target" data-testid="target-input" /></label>
            <p>To personally receive about <strong>${currency(selectedTarget)}</strong>, this scenario requires an estimated company sale price of <strong data-testid="target-price-result">${currency(targetPrice)}</strong>.</p>
          </div>
        </div>
      </article>

      <article class="step">
        <div class="step-number">Step 8</div>
        <div class="step-body">
          <h2>Compare different deal paths</h2>
          <p>The best-looking valuation is not always the best founder outcome. A higher valuation with harsher investor rights can sometimes produce worse founder proceeds than a cleaner deal.</p>
          <div class="comparison-table-wrap">
            <table>
              <thead><tr><th>Example</th><th>Founder ownership</th><th>Investor payback stack</th><th>First founder dollar</th><th>Sale price for $1M founder payout</th></tr></thead>
              <tbody>
                ${DEFAULT_EXAMPLES.map((example) => {
                  const summary = summarizeScenario(example);
                  return `<tr><td>${example.name}</td><td>${pct(summary.founderOwnership)}</td><td>${currency(summary.investorPaybackStack)}</td><td>${currency(summary.firstDollar)}</td><td>${currency(summary.oneMillion)}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>

    <footer class="wp-footer" aria-label="West Peek footer">
      <div class="wp-footer-brand">
        <img src="./brand/wp-logo.png" alt="" aria-hidden="true" />
        <div><strong>West Peek</strong><span>Founder Dilution Dashboard</span></div>
      </div>
      <p>Educational scenario modeling only. Review actual financing documents with qualified legal, tax, and financial advisors.</p>
    </footer>
  `;
}

function updateByPath(path, value) {
  const parts = path.split('-');
  if (parts[0] === 'ownership') activeScenario.startingOwnership[parts[1]] = Number(value);
  if (parts[0] === 'cost') activeScenario.saleCosts[parts[1]] = Number(value);
  if (path === 'selected-sale-price') selectedSalePrice = Number(value);
  if (path === 'selected-target') selectedTarget = Number(value);
  if (parts[0] === 'round') {
    const index = Number(parts[1]);
    const field = parts.slice(2).join('-');
    const actualField = field.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (typeof activeScenario.rounds[index][actualField] === 'boolean') activeScenario.rounds[index][actualField] = Boolean(value);
    else activeScenario.rounds[index][actualField] = Number(value);
  }
}

app.addEventListener('input', (event) => {
  const action = event.target.dataset.action;
  const roundText = event.target.dataset.roundText;
  if (action) updateByPath(action, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
  if (roundText) {
    const [index, field] = roundText.split(':');
    activeScenario.rounds[Number(index)][field] = event.target.value;
  }
  message = 'Numbers updated.';
  render();
});

app.addEventListener('click', (event) => {
  const loadId = event.target.closest('[data-load]')?.dataset.load;
  const loadKind = event.target.closest('[data-load]')?.dataset.kind;
  const action = event.target.dataset.action;
  const salePrice = event.target.dataset.salePrice;
  const removeRound = event.target.dataset.removeRound;

  if (loadId) {
    const source = loadKind === 'saved' ? savedScenarios.find((scenario) => scenario.id === loadId) : findDefaultExample(loadId);
    activeScenario = cloneExample(source);
    selectedSalePrice = activeScenario.salePrices[2] || activeScenario.salePrices[0] || 50000000;
    selectedTarget = activeScenario.founderTargets[1] || 1000000;
    message = `${activeScenario.name} loaded. You can edit every number.`;
  }

  if (salePrice) selectedSalePrice = Number(salePrice);

  if (action === 'save-version') {
    const name = prompt('Name this saved scenario. It will disappear if you refresh.');
    if (name && name.trim()) {
      const copy = cloneExample(activeScenario);
      copy.originalId = activeScenario.originalId || activeScenario.id;
      copy.id = `saved-${Date.now()}`;
      copy.name = name.trim();
      copy.plainSummary = 'Your edited version, kept only while this page is open.';
      savedScenarios.push(copy);
      activeScenario = cloneExample(copy);
      message = 'Saved. This version will disappear if you refresh.';
    }
  }

  if (action === 'reset-current') {
    const original = findDefaultExample(activeScenario.originalId || activeScenario.id) || DEFAULT_EXAMPLES[0];
    activeScenario = cloneExample(original);
    selectedSalePrice = activeScenario.salePrices[2] || activeScenario.salePrices[0] || 50000000;
    message = 'Reset complete. This example is back to the original numbers.';
  }

  if (action === 'clear-saved') {
    savedScenarios = [];
    message = 'Your temporary saved scenarios were cleared.';
  }

  if (action === 'add-round') {
    activeScenario.rounds.push({
      id: `round-${Date.now()}`,
      name: 'New Round',
      invested: 1000000,
      companyValueBeforeInvestment: 9000000,
      investorPaybackMultiple: 1,
      paidBefore: 1,
      getsPaidTwice: false,
      payoutCapMultiple: 0,
      paybackGrows: false,
      annualGrowthRate: 0,
      yearsSinceInvestment: 1
    });
    message = 'New funding round added.';
  }

  if (removeRound !== undefined) {
    activeScenario.rounds.splice(Number(removeRound), 1);
    message = 'Funding round removed.';
  }

  render();
});

render();
