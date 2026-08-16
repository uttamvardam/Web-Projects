/**
 * TaxClarity - Step 4 / Right Column: Side-by-Side Comparison Matrix
 * Exact match to the reference screenshot's table styling, colors, and bottom cards
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    module.exports = factory(Formatters);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.ComparisonTable = factory(root.TaxClarity.Formatters);
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters) {
  'use strict';

  const { formatINR } = Formatters;

  function renderComparisonTable(comparisonResult, containerId = 'comparisonTableContainer') {
    const container = document.getElementById(containerId);
    if (!container || !comparisonResult) return;

    const { oldRegime, newRegime, recommendedRegime, annualSavings, monthlySavings } = comparisonResult;
    const isNewWinning = recommendedRegime === 'NEW';
    const isOldWinning = recommendedRegime === 'OLD';
    const isEqual = (recommendedRegime === 'EQUAL' || annualSavings === 0);

    const fyYear = oldRegime.financialYear || '2025-26';
    const ayYear = fyYear === '2025-26' ? 'AY 2026–27' : 'AY 2025–26';

    const oldStdDed = oldRegime.standardDeduction || 0;
    const newStdDed = newRegime.standardDeduction || 0;
    const oldOtherDed = Math.max(0, (oldRegime.totalDeductions || 0) - oldStdDed);
    const newOtherDed = Math.max(0, (newRegime.totalDeductions || 0) - newStdDed);

    container.innerHTML = `
      <div class="comparison-matrix-wrapper">
        <div class="comparison-matrix-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: var(--text-base); font-weight: 800; color: var(--text-main);">Old vs New Tax Regime Comparison</h3>
            <span class="vs-badge">VS</span>
          </div>
          <span class="badge badge-indigo" style="font-size: 10px; font-weight: 700;">${ayYear}</span>
        </div>

        <table class="comparison-table">
          <thead>
            <tr>
              <th>Tax Metrics</th>
              <th>Old Tax Regime</th>
              <th>
                <div>New Tax Regime</div>
                ${isNewWinning ? '<span class="badge badge-emerald" style="font-size: 8px; padding: 1px 6px; margin-top: 2px;">Recommended</span>' : ''}
                ${isOldWinning ? '<span class="badge badge-emerald" style="font-size: 8px; padding: 1px 6px; margin-top: 2px;">Old Recommended</span>' : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 1. Total Income -->
            <tr>
              <td>1. Total Income</td>
              <td>${formatINR(oldRegime.grossTotalIncome)}</td>
              <td>${formatINR(newRegime.grossTotalIncome)}</td>
            </tr>

            <!-- 2. Standard Deduction -->
            <tr>
              <td>2. Standard Deduction</td>
              <td>${formatINR(oldStdDed)}</td>
              <td>${formatINR(newStdDed)}</td>
            </tr>

            <!-- 3. Other Deductions & Exemptions -->
            <tr>
              <td>3. Other Deductions & Exemptions</td>
              <td>${formatINR(oldOtherDed)}</td>
              <td>${formatINR(newOtherDed)}</td>
            </tr>

            <!-- 4. Total Deductions -->
            <tr>
              <td>4. Total Deductions</td>
              <td>${formatINR(oldRegime.totalDeductions)}</td>
              <td>${formatINR(newRegime.totalDeductions)}</td>
            </tr>

            <!-- 5. Taxable Income -->
            <tr>
              <td>5. Taxable Income</td>
              <td>${formatINR(oldRegime.netTaxableIncome)}</td>
              <td>${formatINR(newRegime.netTaxableIncome)}</td>
            </tr>

            <!-- 6. Tax Before Rebate -->
            <tr>
              <td>6. Tax Before Rebate</td>
              <td>${formatINR(oldRegime.taxBeforeRebate)}</td>
              <td>${formatINR(newRegime.taxBeforeRebate)}</td>
            </tr>

            <!-- 7. Section 87A Rebate -->
            <tr>
              <td>7. Section 87A Rebate</td>
              <td style="color: ${oldRegime.rebate87A > 0 ? 'var(--color-emerald)' : 'inherit'};">${oldRegime.rebate87A > 0 ? `- ${formatINR(oldRegime.rebate87A)}` : '₹ 0'}</td>
              <td style="color: ${newRegime.rebate87A > 0 ? 'var(--color-emerald)' : 'inherit'};">${newRegime.rebate87A > 0 ? `- ${formatINR(newRegime.rebate87A)}` : '₹ 0'}</td>
            </tr>

            <!-- 8. Tax After Rebate -->
            <tr>
              <td>8. Tax After Rebate</td>
              <td>${formatINR(oldRegime.taxAfterRebate)}</td>
              <td>${formatINR(newRegime.taxAfterRebate)}</td>
            </tr>

            <!-- 9. Marginal Relief -->
            <tr>
              <td>9. Marginal Relief</td>
              <td style="color: ${oldRegime.marginalRelief87A > 0 ? 'var(--color-emerald)' : 'inherit'};">${oldRegime.marginalRelief87A > 0 ? `- ${formatINR(oldRegime.marginalRelief87A)}` : '₹ 0'}</td>
              <td style="color: ${newRegime.marginalRelief87A > 0 ? 'var(--color-emerald)' : 'inherit'}; font-weight: ${newRegime.marginalRelief87A > 0 ? '700' : 'normal'};">${newRegime.marginalRelief87A > 0 ? `- ${formatINR(newRegime.marginalRelief87A)}` : '₹ 0'}</td>
            </tr>

            <!-- 10. Tax After Relief -->
            <tr>
              <td>10. Tax After Relief</td>
              <td>${formatINR(oldRegime.taxAfterRelief)}</td>
              <td>${formatINR(newRegime.taxAfterRelief)}</td>
            </tr>

            <!-- 11. Health & Education Cess (4%) -->
            <tr>
              <td>11. Health & Education Cess (4%)</td>
              <td>${formatINR(oldRegime.cess)}</td>
              <td>${formatINR(newRegime.cess)}</td>
            </tr>

            <!-- 12. Final Tax Payable -->
            <tr style="background: var(--color-primary-bg); font-weight: 800; font-size: 13.5px;">
              <td style="color: var(--color-primary); font-weight: 800;">12. Final Tax Payable</td>
              <td style="color: ${isOldWinning ? 'var(--color-emerald-dark)' : (oldRegime.totalTax === 0 ? 'var(--color-emerald-dark)' : 'var(--color-rose)')}; font-weight: 800;">${formatINR(oldRegime.totalTax)}</td>
              <td style="color: ${isNewWinning ? 'var(--color-emerald-dark)' : (newRegime.totalTax === 0 ? 'var(--color-emerald-dark)' : 'var(--color-rose)')}; font-weight: 800;">${formatINR(newRegime.totalTax)}</td>
            </tr>

            <!-- 13. Effective Tax Rate -->
            <tr>
              <td>13. Effective Tax Rate</td>
              <td style="color: var(--text-body); font-weight: 600;">${oldRegime.effectiveTaxRate.toFixed(2)}%</td>
              <td style="color: var(--color-primary); font-weight: 700;">${newRegime.effectiveTaxRate.toFixed(2)}%</td>
            </tr>

            <!-- 14. Annual Tax Savings -->
            <tr>
              <td>14. Annual Tax Savings</td>
              <td>${isOldWinning ? `${formatINR(annualSavings)}` : (isEqual ? '₹ 0' : '—')}</td>
              <td style="color: ${isNewWinning ? 'var(--color-emerald)' : 'inherit'}; font-weight: ${isNewWinning ? '700' : 'normal'};">${isNewWinning ? `${formatINR(annualSavings)}` : (isEqual ? '₹ 0' : '—')}</td>
            </tr>

            <!-- 15. Monthly Tax Savings -->
            <tr>
              <td>15. Monthly Tax Savings</td>
              <td>${isOldWinning ? formatINR(monthlySavings) : (isEqual ? '₹ 0' : '—')}</td>
              <td style="color: ${isNewWinning ? 'var(--color-emerald)' : 'inherit'}; font-weight: ${isNewWinning ? '700' : 'normal'};">${isNewWinning ? formatINR(monthlySavings) : (isEqual ? '₹ 0' : '—')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Analytics Mini Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: 0;">
        <!-- Card 1: Tax-Saving Investments Summary -->
        <div class="glass-card" style="padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: var(--bg-card); border-radius: var(--radius-md);" onclick="if(window.TaxClarity && window.TaxClarity.WizardStepper) window.TaxClarity.WizardStepper.goToStep(3);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="font-size: 1.3rem;">📊</div>
            <div>
              <div style="font-size: 11.5px; font-weight: 700; color: var(--text-main);">Tax-Saving Investments ℹ️</div>
              <div style="font-size: 10.5px; color: var(--text-muted);">Total under Chapter VI-A</div>
            </div>
          </div>
          <strong style="font-size: var(--text-sm); color: var(--text-main); white-space: nowrap;">${formatINR(oldRegime.totalDeductions)} ›</strong>
        </div>

        <!-- Card 2: Simulated Verdict -->
        <div class="glass-card" style="padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="font-size: 1.3rem;">🛡️</div>
            <div>
              <div style="font-size: 11.5px; font-weight: 700; color: var(--text-main);">Simulated Verdict</div>
              <div style="font-size: 10.5px; color: var(--text-muted);">${isEqual ? 'Both Regimes Equal' : 'Your Optimized Outcome'}</div>
            </div>
          </div>
          <strong style="font-size: var(--text-sm); color: var(--color-emerald); white-space: nowrap;">${isEqual ? '₹ 0' : `${formatINR(annualSavings)}/yr ›`}</strong>
        </div>
      </div>
    `;
  }

  return {
    renderComparisonTable
  };
}));
