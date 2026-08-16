/**
 * TaxClarity - Quick Single-Page View Mode Component
 * Renders all input modules on the left and sticky live comparison dashboard on the right
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.QuickView = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function initQuickView() {
    const quickContainer = document.getElementById('quickFlowContainer');
    if (!quickContainer) return;

    const leftCol = document.getElementById('quickInputsCol');
    const rightCol = document.getElementById('quickResultsCol');

    if (leftCol) {
      leftCol.innerHTML = `
        <!-- Section 1: Profile -->
        <div class="glass-card" style="margin-bottom: var(--space-4);">
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px;">
            <span>1️⃣</span>
            <span>Profile & Financial Year</span>
          </h2>
          <div id="quickStep1Content"></div>
        </div>

        <!-- Section 2: Income -->
        <div class="glass-card" style="margin-bottom: var(--space-4);">
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px;">
            <span>2️⃣</span>
            <span>Income Sources</span>
          </h2>
          <div id="quickStep2Content"></div>
        </div>

        <!-- Section 3: Deductions -->
        <div class="glass-card">
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px;">
            <span>3️⃣</span>
            <span>Deductions & Tax Savings</span>
          </h2>
          <div id="quickStep3Content"></div>
        </div>
      `;

      // Render step forms inside quick inputs col
      if (window.TaxClarity.StepProfile) window.TaxClarity.StepProfile.initStepProfile('quickStep1Content');
      if (window.TaxClarity.StepIncome) window.TaxClarity.StepIncome.initStepIncome('quickStep2Content');
      if (window.TaxClarity.StepDeductions) window.TaxClarity.StepDeductions.initStepDeductions('quickStep3Content');
    }

    if (rightCol) {
      rightCol.innerHTML = `
        <div style="position: sticky; top: 80px; display: flex; flex-direction: column; gap: var(--space-4);">
          <!-- Live Verdict Banner -->
          <div id="quickVerdictBannerContainer"></div>

          <!-- Live Visualizer -->
          <div id="quickChartsContainer"></div>

          <!-- Quick Actions -->
          <div style="display: flex; justify-content: flex-end; gap: var(--space-2);">
            <button type="button" class="btn btn-primary btn-sm" onclick="window.print()" style="width: 100%;">
              <span>🖨️</span>
              <span>Print Tax Summary</span>
            </button>
          </div>
        </div>
      `;

      // Subscribe to Store for quick results
      const Store = window.TaxClarity.Store;
      if (Store) {
        Store.subscribe((state) => {
          if (state && state.calculationResults) {
            if (window.TaxClarity.VerdictBanner) {
              window.TaxClarity.VerdictBanner.renderVerdictBanner(state.calculationResults, 'quickVerdictBannerContainer');
            }
            if (window.TaxClarity.Charts) {
              window.TaxClarity.Charts.renderVisualCharts(state.calculationResults, 'quickChartsContainer');
            }
          }
        });
      }
    }
  }

  return {
    initQuickView
  };
}));
