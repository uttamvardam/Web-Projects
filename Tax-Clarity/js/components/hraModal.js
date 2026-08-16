/**
 * TaxClarity - Interactive HRA Exemption Calculator Modal
 * Implements Section 10(13A) Live 3-Rule Breakdown and Auto-Sync
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    const HRACalc = require('../engine/hraCalculator.js');
    module.exports = factory(Formatters, HRACalc);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.HRAModal = factory(
      root.TaxClarity.Formatters,
      root.TaxClarity.HRACalculator
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters, HRACalc) {
  'use strict';

  const { formatINR, parseINR } = Formatters;

  function initHRAModal() {
    let modalEl = document.getElementById('hraCalculatorModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'hraCalculatorModal';
      modalEl.style.cssText = `
        display: none;
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        padding: 16px;
      `;
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div class="glass-card glass-card-elevated" style="max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
        <button id="closeHraModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted);">
          ✕
        </button>

        <div style="margin-bottom: var(--space-4);">
          <h3 style="font-size: var(--text-xl); display: flex; align-items: center; gap: 8px;">
            <span>🏡</span>
            <span>HRA Exemption Calculator (Section 10(13A))</span>
          </h3>
          <p class="form-hint">Automatically calculates your tax-free HRA across the 3 legal conditions (Old Regime only).</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4); background: var(--bg-surface-elevated); padding: var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-xs);">
          <div>
            <span style="color: var(--text-muted);">Basic Salary:</span>
            <strong id="hraModalBasicDisplay" style="display: block; font-size: var(--text-sm);">₹ 0</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">HRA Received:</span>
            <strong id="hraModalReceivedDisplay" style="display: block; font-size: var(--text-sm);">₹ 0</strong>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label" for="hraModalRentInput">
            <span class="form-label-text">
              <span>Annual Rent Paid to Landlord</span>
            </span>
          </label>
          <div class="input-currency-wrapper">
            <span class="currency-prefix">₹</span>
            <input type="text" id="hraModalRentInput" class="form-input formatted-currency" placeholder="2,40,000">
          </div>
          <div class="increment-chips">
            <button type="button" class="chip-btn" data-rent-add="60000">+ ₹60k (₹5k/mo)</button>
            <button type="button" class="chip-btn" data-rent-add="120000">+ ₹1.2L (₹10k/mo)</button>
            <button type="button" class="chip-btn" data-rent-add="240000">+ ₹2.4L (₹20k/mo)</button>
          </div>
        </div>

        <!-- 3 Conditions Breakdown Cards -->
        <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-6);">
          <div id="hraCond1Card" style="padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: var(--text-xs); color: var(--text-muted);">Condition 1: Actual HRA Received</span>
            </div>
            <strong id="hraCond1Val">₹ 0</strong>
          </div>

          <div id="hraCond2Card" style="padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: var(--text-xs); color: var(--text-muted);">Condition 2: Rent Paid minus 10% Basic Salary</span>
            </div>
            <strong id="hraCond2Val">₹ 0</strong>
          </div>

          <div id="hraCond3Card" style="padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: var(--text-xs); color: var(--text-muted);" id="hraCond3Label">Condition 3: 50% of Basic (Metro)</span>
            </div>
            <strong id="hraCond3Val">₹ 0</strong>
          </div>
        </div>

        <!-- Summary & Apply Button -->
        <div style="padding: var(--space-4); background: var(--color-emerald-bg); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: var(--text-xs); font-weight: 600; color: var(--color-emerald);">ELIGIBLE EXEMPT HRA:</span>
            <div id="hraModalExemptResult" style="font-size: var(--text-2xl); font-weight: 800; color: var(--color-emerald);">₹ 0</div>
          </div>
          <button type="button" id="applyHraExemptionBtn" class="btn btn-success">
            Apply Exemption
          </button>
        </div>
      </div>
    `;

    bindModalEvents(modalEl);
  }

  function openHRAModal() {
    const modalEl = document.getElementById('hraCalculatorModal');
    if (!modalEl) {
      initHRAModal();
    }
    const modal = document.getElementById('hraCalculatorModal');
    if (!modal) return;

    const Store = window.TaxClarity.Store;
    if (Store) {
      const state = Store.getState();
      const basic = Number(state.income.basicSalary) || (Number(state.income.grossSalary) * 0.5) || 0;
      const hra = Number(state.income.hraReceived) || (Number(state.income.grossSalary) * 0.2) || 0;
      const isMetro = Boolean(state.profile.isMetro);

      document.getElementById('hraModalBasicDisplay').textContent = formatINR(basic);
      document.getElementById('hraModalReceivedDisplay').textContent = formatINR(hra);
      document.getElementById('hraCond3Label').textContent = `Condition 3: ${isMetro ? '50%' : '40%'} of Basic (${isMetro ? 'Metro' : 'Non-Metro'})`;

      const currentRent = Number(state.deductions.rentPaid) || 0;
      const rentInput = document.getElementById('hraModalRentInput');
      if (rentInput) {
        rentInput.value = currentRent > 0 ? formatINR(currentRent, false) : '';
      }

      calculateModalHRA();
    }

    modal.style.display = 'flex';
  }

  function closeHRAModal() {
    const modal = document.getElementById('hraCalculatorModal');
    if (modal) modal.style.display = 'none';
  }

  function calculateModalHRA() {
    const Store = window.TaxClarity.Store;
    if (!Store) return;

    const state = Store.getState();
    const basic = Number(state.income.basicSalary) || (Number(state.income.grossSalary) * 0.5) || 0;
    const hra = Number(state.income.hraReceived) || (Number(state.income.grossSalary) * 0.2) || 0;
    const isMetro = Boolean(state.profile.isMetro);
    const rent = parseINR(document.getElementById('hraModalRentInput').value);

    const calc = HRACalc || (window.TaxClarity && window.TaxClarity.HRACalculator);
    if (!calc) return;

    const result = calc.calculateHRAExemption({
      basicSalary: basic,
      hraReceived: hra,
      rentPaid: rent,
      isMetro
    });

    document.getElementById('hraCond1Val').textContent = formatINR(result.breakdown.actualHraReceived);
    document.getElementById('hraCond2Val').textContent = formatINR(result.breakdown.rentMinusTenPercent);
    document.getElementById('hraCond3Val').textContent = formatINR(result.breakdown.salaryPercentageLimit);
    document.getElementById('hraModalExemptResult').textContent = formatINR(result.exemptHRA);

    // Highlight winning card
    ['hraCond1Card', 'hraCond2Card', 'hraCond3Card'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.borderColor = 'var(--border-subtle)';
    });

    if (result.exemptHRA > 0) {
      if (result.exemptHRA === result.breakdown.rentMinusTenPercent) {
        document.getElementById('hraCond2Card').style.borderColor = 'var(--color-emerald)';
      } else if (result.exemptHRA === result.breakdown.salaryPercentageLimit) {
        document.getElementById('hraCond3Card').style.borderColor = 'var(--color-emerald)';
      } else {
        document.getElementById('hraCond1Card').style.borderColor = 'var(--color-emerald)';
      }
    }
  }

  function bindModalEvents(modalEl) {
    // Close button
    modalEl.querySelector('#closeHraModalBtn').addEventListener('click', closeHRAModal);

    // Backdrop click
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeHRAModal();
    });

    // Rent Input
    const rentInput = modalEl.querySelector('#hraModalRentInput');
    if (rentInput) {
      rentInput.addEventListener('input', calculateModalHRA);
      rentInput.addEventListener('blur', (e) => {
        e.target.value = formatINR(parseINR(e.target.value), false);
      });
    }

    // Rent Increment chips
    modalEl.querySelectorAll('[data-rent-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const addVal = Number(btn.getAttribute('data-rent-add')) || 0;
        const curVal = parseINR(rentInput.value);
        rentInput.value = formatINR(curVal + addVal, false);
        calculateModalHRA();
      });
    });

    // Apply Button
    modalEl.querySelector('#applyHraExemptionBtn').addEventListener('click', () => {
      const Store = window.TaxClarity.Store;
      const rent = parseINR(rentInput.value);
      const exemptHRA = parseINR(document.getElementById('hraModalExemptResult').textContent);

      if (Store) {
        Store.updateDeductions({
          rentPaid: rent,
          customHRAExemption: exemptHRA
        });

        const customHraInput = document.getElementById('customHRAExemptionInput');
        if (customHraInput) {
          customHraInput.value = formatINR(exemptHRA, false);
        }
      }

      closeHRAModal();
    });
  }

  return {
    initHRAModal,
    openHRAModal,
    closeHRAModal
  };
}));
