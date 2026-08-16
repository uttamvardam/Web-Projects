/**
 * TaxClarity - Step 3: Deductions & Tax-Saving Investments Component
 * Section 80C Hub with Live ₹1.5L Progress Bar, 80D Health Insurance, 80CCD(1B) NPS, and HRA Integration
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    const HRAModal = require('./hraModal.js');
    module.exports = factory(Formatters, HRAModal);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.StepDeductions = factory(
      root.TaxClarity.Formatters,
      root.TaxClarity.HRAModal
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters, HRAModal) {
  'use strict';

  const { formatINR, parseINR } = Formatters;

  function initStepDeductions(containerId = 'step3Content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const Store = window.TaxClarity.Store;
    const dedState = Store ? Store.getState().deductions : {
      sec80C: 0,
      epf: 0,
      ppf: 0,
      elss: 0,
      lifeInsurance: 0,
      homeLoanPrincipal: 0,
      tuitionFees: 0,
      taxSaverFD: 0,
      sec80CCD1B: 0,
      sec80DSelf: 0,
      sec80DParents: 0,
      isParentsSenior: false,
      preventiveHealthCheckup: 0,
      customHRAExemption: 0,
      sec80E: 0,
      sec80G: 0
    };

    container.innerHTML = `
      <!-- Step Card Header -->
      <div class="step-card-header">
        <div class="step-card-header-left">
          <div class="step-avatar-icon">🛡️</div>
          <div>
            <h2 class="step-card-title">Step 3: Deductions & Tax-Saving Investments</h2>
            <p class="step-card-desc">Add eligible investments under Section 80C, 80D, 80CCD, HRA, and Home Loan interest.</p>
          </div>
        </div>
        <div style="font-size: 1.75rem; opacity: 0.85;" aria-hidden="true">💡</div>
      </div>

      <!-- Regime Applicability Notice -->
      <div style="padding: var(--space-3) var(--space-4); background: var(--color-primary-bg); border: 1px solid var(--color-primary-border); border-radius: var(--radius-md); margin-bottom: var(--space-5); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>ℹ️</span>
          <span style="font-size: var(--text-xs); font-weight: 500; color: var(--text-primary);">
            <strong>Note:</strong> Chapter VI-A deductions & HRA apply exclusively to the <strong>Old Tax Regime</strong>. The <strong>New Regime</strong> provides a flat ₹75,000 standard deduction.
          </span>
        </div>
      </div>

      <!-- Section 80C Hub -->
      <div class="glass-card" style="margin-bottom: var(--space-5); background: var(--bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); flex-wrap: wrap; gap: var(--space-2);">
          <div>
            <h3 style="font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>🛡️</span>
              <span>Section 80C Deductions</span>
              <span class="badge badge-emerald">Max ₹1,50,000</span>
            </h3>
            <p class="form-hint">EPF, PPF, ELSS, Life Insurance, Home Loan Principal, Tuition Fees, Tax Saver FD</p>
          </div>
          <button type="button" id="toggle80CBreakdownBtn" class="btn btn-ghost btn-sm" style="color: var(--color-primary);">
            Itemize Components ▼
          </button>
        </div>

        <!-- 80C Progress Bar -->
        <div style="margin: var(--space-3) 0;">
          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
            <span style="color: var(--text-muted);">Progress towards ₹1.5 Lakh Limit:</span>
            <strong id="sec80CProgressText" style="color: var(--color-emerald);">${formatINR(dedState.sec80C)} / ₹ 1,50,000 (${Math.round((Math.min(dedState.sec80C, 150000) / 150000) * 100)}%)</strong>
          </div>
          <div style="height: 8px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--border-subtle);">
            <div id="sec80CProgressFill" style="height: 100%; width: ${(Math.min(dedState.sec80C, 150000) / 150000) * 100}%; background: var(--color-emerald); border-radius: var(--radius-full); transition: width 300ms ease;"></div>
          </div>
        </div>

        <!-- Single 80C Input -->
        <div id="single80CContainer" class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="sec80CInput">
            <span class="form-label-text">Total 80C Investments</span>
            <span class="form-hint">Capped at ₹1,50,000</span>
          </label>
          <div class="input-currency-wrapper">
            <span class="currency-prefix">₹</span>
            <input type="text" id="sec80CInput" class="form-input formatted-currency" 
              value="${formatINR(dedState.sec80C, false)}" placeholder="1,50,000">
          </div>
          <div class="increment-chips">
            <button type="button" class="chip-btn" id="maxOut80CBtn">Max Out (₹1.5 Lakh)</button>
          </div>
        </div>

        <!-- Itemized 80C Breakdown (Collapsible) -->
        <div id="detailed80CContainer" style="display: none; margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px dashed var(--border-medium);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3);">
            <div class="form-group">
              <label class="form-label" for="epfInput">Employees' PF (EPF)</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="epfInput" class="form-input formatted-currency" value="${formatINR(dedState.epf, false)}" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="ppfInput">Public PF (PPF)</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="ppfInput" class="form-input formatted-currency" value="${formatINR(dedState.ppf, false)}" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="elssInput">ELSS Mutual Funds</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="elssInput" class="form-input formatted-currency" value="${formatINR(dedState.elss, false)}" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="lifeInsuranceInput">Life Insurance</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="lifeInsuranceInput" class="form-input formatted-currency" value="${formatINR(dedState.lifeInsurance, false)}" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="homeLoanPrincipalInput">Home Loan Principal</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="homeLoanPrincipalInput" class="form-input formatted-currency" value="${formatINR(dedState.homeLoanPrincipal, false)}" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="tuitionFeesInput">Tuition Fees</label>
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="tuitionFeesInput" class="form-input formatted-currency" value="${formatINR(dedState.tuitionFees, false)}" placeholder="0">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 80D Health Insurance -->
      <div class="glass-card" style="margin-bottom: var(--space-5); background: var(--bg-surface);">
        <h3 style="font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <span>🏥</span>
          <span>Section 80D Health Insurance</span>
          <span class="badge badge-emerald">Max ₹1,00,000</span>
        </h3>
        <p class="form-hint" style="margin-bottom: var(--space-4);">Medical insurance premium paid for Self, Family, and Parents (includes ₹5,000 health checkup)</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3);">
          <div class="glass-card" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface-elevated);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <strong style="font-size: var(--text-xs);">Self, Spouse & Children</strong>
              <span class="badge badge-indigo">Max ₹25k / ₹50k</span>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="sec80DSelfInput" class="form-input formatted-currency" 
                  value="${formatINR(dedState.sec80DSelf, false)}" placeholder="25,000">
              </div>
            </div>
          </div>

          <div class="glass-card" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface-elevated);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <strong style="font-size: var(--text-xs);">Parents</strong>
              <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" id="parentsSeniorCheckbox" ${dedState.isParentsSenior ? 'checked' : ''}>
                <span>Senior (60+)</span>
              </label>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <div class="input-currency-wrapper">
                <span class="currency-prefix">₹</span>
                <input type="text" id="sec80DParentsInput" class="form-input formatted-currency" 
                  value="${formatINR(dedState.sec80DParents, false)}" placeholder="25,000">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NPS & HRA Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-5);">
        
        <!-- Section 80CCD(1B) NPS -->
        <div class="glass-card" style="background: var(--bg-surface);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <h3 style="font-size: var(--text-sm); font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>📈</span>
              <span>National Pension System</span>
            </h3>
            <span class="badge badge-emerald">Sec 80CCD(1B)</span>
          </div>
          <p class="form-hint" style="margin-bottom: var(--space-3);">Additional voluntary NPS contribution up to ₹50,000</p>

          <div class="form-group" style="margin-bottom: 0;">
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="sec80CCD1BInput" class="form-input formatted-currency" 
                value="${formatINR(dedState.sec80CCD1B, false)}" placeholder="50,000">
            </div>
            <div class="increment-chips">
              <button type="button" class="chip-btn" id="maxOutNpsBtn">Max Out (₹50,000)</button>
            </div>
          </div>
        </div>

        <!-- HRA Exemption Hub -->
        <div class="glass-card" style="background: var(--bg-surface);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <h3 style="font-size: var(--text-sm); font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>🏡</span>
              <span>House Rent Allowance (HRA)</span>
            </h3>
            <span class="badge badge-indigo">Sec 10(13A)</span>
          </div>
          <p class="form-hint" style="margin-bottom: var(--space-3);">Exempt HRA based on rent paid and basic salary (Old Regime)</p>

          <div class="form-group" style="margin-bottom: 0;">
            <div class="input-currency-wrapper" style="margin-bottom: var(--space-2);">
              <span class="currency-prefix">₹</span>
              <input type="text" id="customHRAExemptionInput" class="form-input formatted-currency" 
                value="${formatINR(dedState.customHRAExemption, false)}" placeholder="0">
            </div>
            <button type="button" id="openHraCalcModalBtn" class="btn btn-secondary btn-sm" style="width: 100%;">
              <span>🧮</span>
              <span>Auto-Calculate HRA (3 Conditions)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Other Deductions (80E, 80G) -->
      <div class="glass-card" style="background: var(--bg-surface);">
        <h3 style="font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <span>📑</span>
          <span>Other Chapter VI-A Deductions</span>
        </h3>
        <p class="form-hint" style="margin-bottom: var(--space-3);">Education loan interest (80E) and eligible donations (80G)</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="sec80EInput">
              <span class="form-label-text">
                <span>Education Loan Interest (80E)</span>
              </span>
            </label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="sec80EInput" class="form-input formatted-currency" 
                value="${formatINR(dedState.sec80E, false)}" placeholder="0">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="sec80GInput">
              <span class="form-label-text">
                <span>Charitable Donations (80G)</span>
              </span>
            </label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="text" id="sec80GInput" class="form-input formatted-currency" 
                value="${formatINR(dedState.sec80G, false)}" placeholder="0">
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents(container);
    update80CProgressBar();
  }

  function update80CProgressBar() {
    const Store = window.TaxClarity.Store;
    if (!Store) return;

    const ded = Store.getState().deductions;
    const raw80C = Number(ded.sec80C) || (
      (Number(ded.epf) || 0) +
      (Number(ded.ppf) || 0) +
      (Number(ded.elss) || 0) +
      (Number(ded.lifeInsurance) || 0) +
      (Number(ded.homeLoanPrincipal) || 0) +
      (Number(ded.tuitionFees) || 0)
    );

    const eligible = Math.min(150000, raw80C);
    const percentage = Math.min(100, Math.round((eligible / 150000) * 100));

    const fillEl = document.getElementById('sec80CProgressFill');
    const textEl = document.getElementById('sec80CProgressText');

    if (fillEl) fillEl.style.width = `${percentage}%`;
    if (textEl) {
      textEl.textContent = `₹ ${eligible.toLocaleString('en-IN')} / ₹ 1,50,000 (${percentage}%)`;
    }
  }

  function bindEvents(container) {
    const Store = window.TaxClarity.Store;
    if (!Store) return;

    // Toggle 80C Breakdown
    const toggleBtn = document.getElementById('toggle80CBreakdownBtn');
    const detailedContainer = document.getElementById('detailed80CContainer');

    if (toggleBtn && detailedContainer) {
      let isDetailed = false;
      toggleBtn.addEventListener('click', () => {
        isDetailed = !isDetailed;
        detailedContainer.style.display = isDetailed ? 'block' : 'none';
        toggleBtn.textContent = isDetailed ? 'Collapse Items ▲' : 'Itemize Components ▼';
      });
    }

    // Max out 80C
    const max80CBtn = document.getElementById('maxOut80CBtn');
    const sec80CInput = document.getElementById('sec80CInput');
    if (max80CBtn && sec80CInput) {
      max80CBtn.addEventListener('click', () => {
        sec80CInput.value = formatINR(150000, false);
        Store.updateDeductions({ sec80C: 150000 });
        update80CProgressBar();
      });
    }

    // 80C Input
    if (sec80CInput) {
      sec80CInput.addEventListener('input', () => {
        const val = parseINR(sec80CInput.value);
        Store.updateDeductions({ sec80C: val });
        update80CProgressBar();
      });
      sec80CInput.addEventListener('blur', () => {
        sec80CInput.value = formatINR(parseINR(sec80CInput.value), false);
      });
    }

    // Detailed 80C items
    const itemized80CIds = ['epfInput', 'ppfInput', 'elssInput', 'lifeInsuranceInput', 'homeLoanPrincipalInput', 'tuitionFeesInput'];
    itemized80CIds.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => {
          const sum = itemized80CIds.reduce((acc, currId) => {
            const el = document.getElementById(currId);
            return acc + (el ? parseINR(el.value) : 0);
          }, 0);

          if (sec80CInput) sec80CInput.value = formatINR(sum, false);
          Store.updateDeductions({ sec80C: sum });
          update80CProgressBar();
        });
        input.addEventListener('blur', () => {
          input.value = formatINR(parseINR(input.value), false);
        });
      }
    });

    // 80D Inputs
    const sec80DSelf = document.getElementById('sec80DSelfInput');
    if (sec80DSelf) {
      sec80DSelf.addEventListener('input', () => {
        Store.updateDeductions({ sec80DSelf: parseINR(sec80DSelf.value) });
      });
      sec80DSelf.addEventListener('blur', () => {
        sec80DSelf.value = formatINR(parseINR(sec80DSelf.value), false);
      });
    }

    const sec80DParents = document.getElementById('sec80DParentsInput');
    if (sec80DParents) {
      sec80DParents.addEventListener('input', () => {
        Store.updateDeductions({ sec80DParents: parseINR(sec80DParents.value) });
      });
      sec80DParents.addEventListener('blur', () => {
        sec80DParents.value = formatINR(parseINR(sec80DParents.value), false);
      });
    }

    const parentsSenior = document.getElementById('parentsSeniorCheckbox');
    if (parentsSenior) {
      parentsSenior.addEventListener('change', (e) => {
        Store.updateDeductions({ isParentsSenior: e.target.checked });
      });
    }

    // NPS 80CCD(1B)
    const npsInput = document.getElementById('sec80CCD1BInput');
    const maxNpsBtn = document.getElementById('maxOutNpsBtn');
    if (npsInput) {
      npsInput.addEventListener('input', () => {
        Store.updateDeductions({ sec80CCD1B: parseINR(npsInput.value) });
      });
      npsInput.addEventListener('blur', () => {
        npsInput.value = formatINR(parseINR(npsInput.value), false);
      });
    }
    if (maxNpsBtn && npsInput) {
      maxNpsBtn.addEventListener('click', () => {
        npsInput.value = formatINR(50000, false);
        Store.updateDeductions({ sec80CCD1B: 50000 });
      });
    }

    // HRA Modal trigger
    const openHraBtn = document.getElementById('openHraCalcModalBtn');
    if (openHraBtn) {
      openHraBtn.addEventListener('click', () => {
        const modal = HRAModal || (window.TaxClarity && window.TaxClarity.HRAModal);
        if (modal) modal.openHRAModal();
      });
    }

    const customHRAInput = document.getElementById('customHRAExemptionInput');
    if (customHRAInput) {
      customHRAInput.addEventListener('input', () => {
        Store.updateDeductions({ customHRAExemption: parseINR(customHRAInput.value) });
      });
      customHRAInput.addEventListener('blur', () => {
        customHRAInput.value = formatINR(parseINR(customHRAInput.value), false);
      });
    }

    // 80E & 80G
    ['sec80EInput', 'sec80GInput'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => {
          const patch = {};
          patch[id.replace('Input', '')] = parseINR(input.value);
          Store.updateDeductions(patch);
        });
        input.addEventListener('blur', () => {
          input.value = formatINR(parseINR(input.value), false);
        });
      }
    });

    // Re-initialize tooltips
    if (window.TaxClarity && window.TaxClarity.Tooltip) {
      window.TaxClarity.Tooltip.initTooltips();
    }
  }

  return {
    initStepDeductions
  };
}));
