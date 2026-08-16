/**
 * TaxClarity - Step 2: Income Sources Component
 * Handles Quick vs Detailed Salary CTC Breakdown, House Property Loss/Income, and Other Taxable Receipts
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    module.exports = factory(Formatters);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.StepIncome = factory(root.TaxClarity.Formatters);
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters) {
  'use strict';

  const { formatINR, parseINR, numberToIndianWords } = Formatters;

  function initStepIncome(containerId = 'step2Content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const Store = window.TaxClarity.Store;
    const incomeState = Store ? Store.getState().income : {
      salaryMode: 'quick',
      grossSalary: 0,
      basicSalary: 0,
      hraReceived: 0,
      specialAllowance: 0,
      otherAllowances: 0,
      rentalIncome: 0,
      municipalTaxes: 0,
      homeLoanInterest: 0,
      savingsInterest: 0,
      fdInterest: 0,
      dividendIncome: 0,
      capitalGains: 0,
      businessIncome: 0
    };

    container.innerHTML = `
      <!-- Step Card Header -->
      <div class="step-card-header">
        <div class="step-card-header-left">
          <div>
            <h2 class="step-card-title">Step 2: Income Sources</h2>
            <p class="step-card-desc">Add your income details from all sources to get accurate tax comparison.</p>
          </div>
        </div>
        <div style="font-size: 1.75rem; opacity: 0.85;" aria-hidden="true">📈</div>
      </div>

      <!-- Card 1: Salary Income / CTC -->
      <div class="sub-card">
        <div class="sub-card-header">
          <div class="sub-card-header-left">
            <div class="sub-card-icon blue">💼</div>
            <div>
              <div class="sub-card-title">Salary Income / CTC</div>
              <div class="sub-card-subtitle">Enter your total annual CTC or salary components</div>
            </div>
          </div>
          
          <div class="pill-switcher">
            <button type="button" class="pill-option ${incomeState.salaryMode === 'quick' ? 'active' : ''}" data-salary-mode="quick">
              Quick Gross CTC
            </button>
            <button type="button" class="pill-option ${incomeState.salaryMode === 'detailed' ? 'active' : ''}" data-salary-mode="detailed">
              Detailed Breakdown
            </button>
          </div>
        </div>

        <!-- Quick Mode Input -->
        <div id="quickSalaryContainer" style="display: ${incomeState.salaryMode === 'quick' ? 'block' : 'none'};">
          <div class="form-group" style="margin-bottom: 0;">
            <div class="form-label">
              <span class="form-label-text">
                <span>Annual Gross Salary / CTC</span>
              </span>
              <span id="grossSalaryWords" class="form-hint" style="color: var(--color-primary); font-weight: 600;">
                ℹ️ ${numberToIndianWords(incomeState.grossSalary)}
              </span>
            </div>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="grossSalaryInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.grossSalary, false)}" placeholder="13,00,000">
            </div>
            <div class="increment-chips">
              <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Quick Add:</span>
              <button type="button" class="chip-btn" data-inc-target="grossSalaryInput" data-inc-val="50000">+ ₹50K</button>
              <button type="button" class="chip-btn" data-inc-target="grossSalaryInput" data-inc-val="100000">+ ₹1 Lakh</button>
              <button type="button" class="chip-btn" data-inc-target="grossSalaryInput" data-inc-val="500000">+ ₹5 Lakh</button>
              <button type="button" class="chip-btn" data-inc-target="grossSalaryInput" data-inc-val="1000000">+ ₹10 Lakh</button>
            </div>
          </div>
        </div>

        <!-- Detailed Mode Inputs -->
        <div id="detailedSalaryContainer" style="display: ${incomeState.salaryMode === 'detailed' ? 'block' : 'none'};">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">
            <div class="form-group">
              <label class="form-label" for="basicSalaryInput">
                <span class="form-label-text">Basic Salary</span>
                <span class="form-hint">HRA baseline</span>
              </label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="basicSalaryInput" class="form-input formatted-currency" 
                  value="${formatINR(incomeState.basicSalary, false)}" placeholder="6,50,000">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="hraReceivedInput">
                <span class="form-label-text">HRA Received</span>
              </label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="hraReceivedInput" class="form-input formatted-currency" 
                  value="${formatINR(incomeState.hraReceived, false)}" placeholder="2,60,000">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="specialAllowanceInput">
                <span class="form-label-text">Special Allowance</span>
              </label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="specialAllowanceInput" class="form-input formatted-currency" 
                  value="${formatINR(incomeState.specialAllowance, false)}" placeholder="2,60,000">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="otherAllowancesInput">
                <span class="form-label-text">Bonus / Other Allowances</span>
              </label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="otherAllowancesInput" class="form-input formatted-currency" 
                  value="${formatINR(incomeState.otherAllowances, false)}" placeholder="1,30,000">
              </div>
            </div>
          </div>

          <div style="margin-top: var(--space-3); padding: var(--space-3); background: var(--bg-surface-elevated); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: var(--text-xs); font-weight: 600;">Calculated Gross Salary:</span>
            <span id="detailedGrossTotalBadge" style="font-size: var(--text-sm); font-weight: 800; color: var(--color-primary);">
              ${formatINR(incomeState.grossSalary)}
            </span>
          </div>
        </div>
      </div>

      <!-- Card 2: House Property Section -->
      <div class="sub-card">
        <div class="sub-card-header">
          <div class="sub-card-header-left">
            <div class="sub-card-icon purple">🏠</div>
            <div>
              <div class="sub-card-title">Income / Loss from House Property</div>
              <div class="sub-card-subtitle">Home loan interest deductible up to ₹2,00,000 (Sec 24b)</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div class="form-group" style="margin-bottom: 0;">
            <div class="form-label">
              <span class="form-label-text">
                <span>Home Loan Interest (Self-Occupied)</span>
              </span>
              <span class="badge badge-emerald">Sec 24(b)</span>
            </div>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="homeLoanInterestInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.homeLoanInterest, false)}" placeholder="0">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <div class="form-label">
              <span class="form-label-text">
                <span>Rental Income (Let-out Property)</span>
              </span>
            </div>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="rentalIncomeInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.rentalIncome, false)}" placeholder="0">
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Other Sources & Business -->
      <div class="sub-card" style="margin-bottom: var(--space-4);">
        <div class="sub-card-header">
          <div class="sub-card-header-left">
            <div class="sub-card-icon indigo">📈</div>
            <div>
              <div class="sub-card-title">Income from Other Sources & Business</div>
              <div class="sub-card-subtitle">Interest from savings accounts, fixed deposits, dividends, freelance earnings</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div class="form-group">
            <label class="form-label" for="savingsInterestInput">
              <span class="form-label-text">Savings Bank Interest</span>
            </label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="savingsInterestInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.savingsInterest, false)}" placeholder="0">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="fdInterestInput">
              <span class="form-label-text">Fixed Deposit (FD) Interest</span>
            </label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="fdInterestInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.fdInterest, false)}" placeholder="0">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="dividendIncomeInput">
              <span class="form-label-text">Dividend / Other Income</span>
            </label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="dividendIncomeInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.dividendIncome, false)}" placeholder="0">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="businessIncomeInput">
              <span class="form-label-text">Business / Freelance Profit</span>
            </label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="businessIncomeInput" class="form-input formatted-currency" 
                value="${formatINR(incomeState.businessIncome, false)}" placeholder="0">
            </div>
          </div>
        </div>
      </div>
    `;

    bindIncomeEvents(container);
  }

  function bindIncomeEvents(container) {
    const Store = window.TaxClarity.Store;
    if (!Store) return;

    // Toggle Salary Mode
    const modeButtons = container.querySelectorAll('.pill-option[data-salary-mode]');
    const quickContainer = container.querySelector('#quickSalaryContainer');
    const detailedContainer = container.querySelector('#detailedSalaryContainer');

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-salary-mode');
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (mode === 'quick') {
          if (quickContainer) quickContainer.style.display = 'block';
          if (detailedContainer) detailedContainer.style.display = 'none';
        } else {
          if (quickContainer) quickContainer.style.display = 'none';
          if (detailedContainer) detailedContainer.style.display = 'block';
        }
        Store.updateIncome({ salaryMode: mode });
      });
    });

    // Quick Salary Input
    const grossInput = container.querySelector('#grossSalaryInput');
    const wordsEl = container.querySelector('#grossSalaryWords');

    if (grossInput) {
      grossInput.addEventListener('input', (e) => {
        const raw = parseINR(e.target.value);
        if (wordsEl) wordsEl.textContent = `ℹ️ ${numberToIndianWords(raw)}`;
        Store.updateIncome({ grossSalary: raw });
      });

      grossInput.addEventListener('blur', (e) => {
        const raw = parseINR(e.target.value);
        e.target.value = formatINR(raw, false);
      });
    }

    // Quick Add Increment Chips
    const incChips = container.querySelectorAll('.chip-btn[data-inc-target]');
    incChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-inc-target');
        const incVal = Number(chip.getAttribute('data-inc-val')) || 0;
        const input = container.querySelector(`#${targetId}`);
        if (input) {
          const current = parseINR(input.value);
          const updated = current + incVal;
          input.value = formatINR(updated, false);
          if (wordsEl) wordsEl.textContent = `ℹ️ ${numberToIndianWords(updated)}`;
          Store.updateIncome({ grossSalary: updated });
        }
      });
    });

    // Detailed Salary Inputs
    const detailedInputs = [
      { id: 'basicSalaryInput', key: 'basicSalary' },
      { id: 'hraReceivedInput', key: 'hraReceived' },
      { id: 'specialAllowanceInput', key: 'specialAllowance' },
      { id: 'otherAllowancesInput', key: 'otherAllowances' }
    ];

    detailedInputs.forEach(({ id, key }) => {
      const input = container.querySelector(`#${id}`);
      if (input) {
        input.addEventListener('input', () => {
          const val = parseINR(input.value);
          Store.updateIncome({ [key]: val });
          updateDetailedTotalBadge(container);
        });

        input.addEventListener('blur', () => {
          const val = parseINR(input.value);
          input.value = formatINR(val, false);
        });
      }
    });

    // Other Income Inputs
    const otherInputs = [
      { id: 'homeLoanInterestInput', key: 'homeLoanInterest' },
      { id: 'rentalIncomeInput', key: 'rentalIncome' },
      { id: 'savingsInterestInput', key: 'savingsInterest' },
      { id: 'fdInterestInput', key: 'fdInterest' },
      { id: 'dividendIncomeInput', key: 'dividendIncome' },
      { id: 'businessIncomeInput', key: 'businessIncome' }
    ];

    otherInputs.forEach(({ id, key }) => {
      const input = container.querySelector(`#${id}`);
      if (input) {
        input.addEventListener('input', () => {
          const val = parseINR(input.value);
          Store.updateIncome({ [key]: val });
        });

        input.addEventListener('blur', () => {
          const val = parseINR(input.value);
          input.value = formatINR(val, false);
        });
      }
    });
  }

  function updateDetailedTotalBadge(container) {
    const Store = window.TaxClarity.Store;
    if (!Store) return;
    const inc = Store.getState().income;
    const total = (Number(inc.basicSalary) || 0) + (Number(inc.hraReceived) || 0) + 
                  (Number(inc.specialAllowance) || 0) + (Number(inc.otherAllowances) || 0);
    const badge = container.querySelector('#detailedGrossTotalBadge');
    if (badge) badge.textContent = formatINR(total);
    Store.updateIncome({ grossSalary: total });
  }

  return {
    initStepIncome
  };
}));
