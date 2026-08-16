/**
 * TaxClarity - Step 4 / Right Column: Tax Comparison Overview & Recommendation Hero
 * Renders the top overview header, dark blue gradient recommendation hero, and 5 KPI cards
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    module.exports = factory(Formatters);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.VerdictBanner = factory(root.TaxClarity.Formatters);
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters) {
  'use strict';

  const { formatINR } = Formatters;

  function renderVerdictBanner(comparisonResult, containerId = 'verdictBannerContainer') {
    const container = document.getElementById(containerId);
    if (!container || !comparisonResult) return;

    const {
      recommendedRegime,
      annualSavings,
      monthlySavings,
      oldRegime,
      newRegime
    } = comparisonResult;

    const isNewWinning = recommendedRegime === 'NEW';
    const isOldWinning = recommendedRegime === 'OLD';
    const isEqual = (recommendedRegime === 'EQUAL' || annualSavings === 0);

    const activeRegime = isOldWinning ? oldRegime : newRegime;
    const headline = isEqual
      ? 'Both Regimes Result in the Same Tax!'
      : `${recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'} is Better for You! 🎉`;

    const subtext = isEqual
      ? 'With your current income and zero deductions, both tax regimes are identical.'
      : `With your profile and investments, you save more under the ${recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}.`;

    container.innerHTML = `
      <!-- Recommendation Hero Card -->
      <div class="recommendation-hero-card">
        <div class="recommendation-hero-left">
          <div class="trophy-badge" aria-hidden="true">🏆</div>
          <div>
            <div class="recommendation-title">${headline}</div>
            <div class="recommendation-subtitle">${subtext}</div>
          </div>
        </div>

        <div class="savings-breakout-card">
          <div class="savings-breakout-label">${isEqual ? 'TAX PAYABLE' : 'YOU SAVE ANNUALLY'}</div>
          <div class="savings-breakout-amount">
            ${isEqual ? formatINR(newRegime.totalTax) : formatINR(annualSavings)}
          </div>
          ${!isEqual ? `
            <div class="savings-breakout-monthly">
              + ${formatINR(monthlySavings)} extra / month
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 5 KPI Metrics Grid -->
      <div class="kpi-cards-grid">
        <div class="kpi-mini-card">
          <span class="kpi-icon">🛡️</span>
          <div class="kpi-content">
            <div class="kpi-label">Gross Total Income</div>
            <div class="kpi-value">${formatINR(activeRegime.grossTotalIncome)}</div>
          </div>
        </div>

        <div class="kpi-mini-card">
          <span class="kpi-icon">📋</span>
          <div class="kpi-content">
            <div class="kpi-label">Total Deductions</div>
            <div class="kpi-value">${formatINR(activeRegime.totalDeductions)}</div>
          </div>
        </div>

        <div class="kpi-mini-card">
          <span class="kpi-icon">📝</span>
          <div class="kpi-content">
            <div class="kpi-label">Taxable Income</div>
            <div class="kpi-value">${formatINR(activeRegime.netTaxableIncome)}</div>
          </div>
        </div>

        <div class="kpi-mini-card">
          <span class="kpi-icon">📊</span>
          <div class="kpi-content">
            <div class="kpi-label">Effective Tax Rate</div>
            <div class="kpi-value">${activeRegime.effectiveTaxRate.toFixed(2)}% <span class="badge badge-emerald" style="font-size: 8px; padding: 1px 4px; vertical-align: middle;">${recommendedRegime}</span></div>
          </div>
        </div>

        <div class="kpi-mini-card">
          <span class="kpi-icon">🏠</span>
          <div class="kpi-content">
            <div class="kpi-label">Take Home Income</div>
            <div class="kpi-value">${formatINR(activeRegime.annualTakeHome)}</div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderVerdictBanner
  };
}));
