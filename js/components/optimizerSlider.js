/**
 * TaxClarity - Step 4 / Advanced: "What-If" Breakeven Tax-Saving Optimizer Slider
 * Simulates additional deductions interactively to find crossover points and suggests investment avenues
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    const OldRegimeCalc = require('../engine/oldRegimeCalculator.js');
    module.exports = factory(Formatters, OldRegimeCalc);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.OptimizerSlider = factory(
      root.TaxClarity.Formatters,
      root.TaxClarity.OldRegimeCalculator
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters, OldRegimeCalc) {
  'use strict';

  const { formatINR, parseINR } = Formatters;

  function renderOptimizerSlider(comparisonResult, containerId = 'optimizerSliderContainer') {
    const container = document.getElementById(containerId);
    if (!container || !comparisonResult) return;

    const { breakeven, recommendedRegime, oldRegime, newRegime } = comparisonResult;
    const isNewWinning = recommendedRegime === 'NEW';
    const targetAdditional = breakeven ? (breakeven.additionalDeductionsNeeded || 0) : 0;

    container.innerHTML = `
      <div class="glass-card" style="background: var(--bg-surface); margin-bottom: var(--space-6); border: 1px solid var(--border-medium);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
          <div>
            <h3 style="font-size: var(--text-lg); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>🎯</span>
              <span>"What-If" Tax-Saving Breakeven Optimizer</span>
            </h3>
            <p class="form-hint">
              ${isNewWinning 
                ? `Find out how much extra deduction is needed to make the Old Regime beat the New Regime.`
                : `Your existing deductions already make the Old Regime more beneficial!`}
            </p>
          </div>
          <span class="badge ${isNewWinning ? 'badge-amber' : 'badge-emerald'}">
            ${isNewWinning ? `Target: + ${formatINR(targetAdditional)}` : 'Old Regime Winning'}
          </span>
        </div>

        <!-- Breakeven Target Banner -->
        ${isNewWinning ? `
        <div style="padding: var(--space-3) var(--space-4); background: var(--color-amber-bg); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); margin-bottom: var(--space-4); font-size: var(--text-xs); color: var(--text-primary);">
          <strong>Breakeven Goal:</strong> If you invest an additional <strong>${formatINR(targetAdditional)}</strong> under Chapter VI-A (80C, 80D, NPS) or claim eligible HRA, the <strong>Old Regime</strong> will match or beat the New Regime.
        </div>
        ` : `
        <div style="padding: var(--space-3) var(--space-4); background: var(--color-emerald-bg); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); margin-bottom: var(--space-4); font-size: var(--text-xs); color: var(--text-primary);">
          <strong>Optimal Position:</strong> Your current deductions of <strong>${formatINR(oldRegime.totalDeductions)}</strong> already beat the New Regime by <strong>${formatINR(comparisonResult.annualSavings)}/year</strong>.
        </div>
        `}

        <!-- Interactive Slider Box -->
        <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <label for="whatIfDeductionSlider" style="font-size: var(--text-sm); font-weight: 600;">
              Simulate Additional Investments / Deductions:
            </label>
            <strong id="sliderSimulatedAmount" style="font-size: var(--text-lg); color: var(--color-indigo-light);">
              + ${formatINR(isNewWinning ? Math.min(targetAdditional, 300000) : 0)}
            </strong>
          </div>

          <input type="range" id="whatIfDeductionSlider" min="0" max="300000" step="5000" 
            value="${isNewWinning ? Math.min(targetAdditional, 300000) : 0}" 
            style="width: 100%; cursor: pointer; accent-color: var(--color-indigo);">

          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px;">
            <span>₹ 0</span>
            <span>+ ₹ 1,00,000</span>
            <span>+ ₹ 2,00,000</span>
            <span>+ ₹ 3,00,000</span>
          </div>
        </div>

        <!-- Live Simulation Outcome Box -->
        <div id="simulationOutcomeBox" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3); font-size: var(--text-xs); margin-bottom: var(--space-4);">
          <!-- Updated dynamically by slider event -->
        </div>

        <!-- Actionable Suggestions -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-4);">
          <h4 style="font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-2);">
            Recommended Avenues to Bridge the Gap:
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-2); font-size: var(--text-xs);">
            <div style="background: var(--bg-surface-elevated); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);">
              <strong>🛡️ Section 80C:</strong> Invest in ELSS / PPF up to ₹1.5 Lakh.
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);">
              <strong>📈 Section 80CCD(1B):</strong> Add voluntary NPS up to ₹50,000.
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);">
              <strong>🏥 Section 80D:</strong> Medical insurance for Self (₹25k) & Parents (₹50k).
            </div>
          </div>
        </div>

      </div>
    `;

    bindSliderEvents(container, comparisonResult);
  }

  function bindSliderEvents(container, comparisonResult) {
    const slider = container.querySelector('#whatIfDeductionSlider');
    const amountLabel = container.querySelector('#sliderSimulatedAmount');
    const outcomeBox = container.querySelector('#simulationOutcomeBox');

    if (!slider || !outcomeBox) return;

    function updateSimulation() {
      const addedDeduction = parseInt(slider.value, 10) || 0;
      amountLabel.textContent = `+ ${formatINR(addedDeduction)}`;

      const Store = window.TaxClarity.Store;
      if (!Store) return;

      const state = Store.getState();
      const calc = OldRegimeCalc || (window.TaxClarity && window.TaxClarity.OldRegimeCalculator);
      if (!calc) return;

      // Simulate with extra deduction added to otherDeductions
      const simulatedDeductions = {
        ...state.deductions,
        otherDeductions: (Number(state.deductions.otherDeductions) || 0) + addedDeduction
      };

      const simOldResult = calc.calculateOldRegimeTax(
        state.income,
        simulatedDeductions,
        state.profile,
        state.profile.financialYear
      );

      const newTax = comparisonResult.newRegime.totalTax;
      const simOldTax = simOldResult.totalTax;
      const simDiff = Math.abs(simOldTax - newTax);
      const isSimOldCheaper = simOldTax < newTax;
      const isSimEqual = simOldTax === newTax;

      outcomeBox.innerHTML = `
        <div style="background: var(--bg-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <span style="color: var(--text-muted);">Simulated Total Deductions:</span>
          <strong style="display: block; font-size: var(--text-sm);">${formatINR(simOldResult.totalDeductions)}</strong>
        </div>

        <div style="background: var(--bg-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <span style="color: var(--text-muted);">Simulated Old Regime Tax:</span>
          <strong style="display: block; font-size: var(--text-sm); ${isSimOldCheaper ? 'color: var(--color-emerald);' : ''}">${formatINR(simOldTax)}</strong>
        </div>

        <div style="background: var(--bg-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid ${isSimOldCheaper ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'};">
          <span style="color: var(--text-muted);">Simulated Verdict:</span>
          <strong style="display: block; font-size: var(--text-sm); color: ${isSimOldCheaper ? 'var(--color-emerald)' : (isSimEqual ? 'var(--color-indigo-light)' : 'var(--text-secondary)')};">
            ${isSimOldCheaper ? `Old Regime saves you ${formatINR(simDiff)}!` : (isSimEqual ? 'Both regimes equal' : `New Regime still cheaper by ${formatINR(simDiff)}`)}
          </strong>
        </div>
      `;
    }

    slider.addEventListener('input', updateSimulation);
    updateSimulation();
  }

  return {
    renderOptimizerSlider
  };
}));
