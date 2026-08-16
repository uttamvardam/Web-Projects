/**
 * TaxClarity - Interactive Visual Analytics (SVG Charts Engine)
 * High-performance, zero-dependency SVG Donut and Comparative Bar Visualizations
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    module.exports = factory(Formatters);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.Charts = factory(root.TaxClarity.Formatters);
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters) {
  'use strict';

  const { formatINR } = Formatters;

  function renderVisualCharts(comparisonResult, containerId = 'chartsContainer') {
    const container = document.getElementById(containerId);
    if (!container || !comparisonResult) return;

    const { recommendedRegime, oldRegime, newRegime } = comparisonResult;
    const activeRegime = (recommendedRegime === 'OLD') ? oldRegime : newRegime;

    const gross = activeRegime.grossTotalIncome || 1;
    const tax = activeRegime.totalTax || 0;
    const deductions = activeRegime.totalDeductions || 0;
    const takeHome = Math.max(0, gross - tax);

    const takeHomePct = Math.round((takeHome / gross) * 100);
    const taxPct = Math.round((tax / gross) * 100);
    const dedPct = Math.min(100, Math.round((deductions / gross) * 100));

    // SVG Donut calculation
    const radius = 65;
    const circumference = 2 * Math.PI * radius; // ~408.4

    const takeHomeDash = (takeHome / gross) * circumference;
    const taxDash = (tax / gross) * circumference;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-6);">
        
        <!-- Donut Chart: Where Your Salary Goes -->
        <div class="glass-card" style="background: var(--bg-surface); display: flex; flex-direction: column; align-items: center;">
          <h3 style="font-size: var(--text-base); font-weight: 700; margin-bottom: var(--space-4); align-self: flex-start;">
            <span>🍩</span>
            <span>Income Allocation (${recommendedRegime === 'OLD' ? 'Old' : 'New'} Regime)</span>
          </h3>

          <div style="position: relative; width: 170px; height: 170px; margin-bottom: var(--space-4);">
            <svg viewBox="0 0 170 170" width="100%" height="100%" style="transform: rotate(-90deg);">
              <!-- Base Track -->
              <circle cx="85" cy="85" r="${radius}" fill="transparent" stroke="var(--border-subtle)" stroke-width="24" />
              
              <!-- Take Home Slice (Emerald) -->
              <circle cx="85" cy="85" r="${radius}" fill="transparent" stroke="var(--color-emerald)" stroke-width="24"
                stroke-dasharray="${takeHomeDash} ${circumference}"
                stroke-dashoffset="0"
                stroke-linecap="round"
                style="transition: stroke-dasharray 600ms ease-out;" />

              <!-- Tax Slice (Rose) -->
              <circle cx="85" cy="85" r="${radius}" fill="transparent" stroke="var(--color-rose)" stroke-width="24"
                stroke-dasharray="${taxDash} ${circumference}"
                stroke-dashoffset="-${takeHomeDash}"
                stroke-linecap="round"
                style="transition: stroke-dasharray 600ms ease-out;" />
            </svg>

            <!-- Center Text -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <span style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 600;">In-Hand</span>
              <strong style="font-size: var(--text-xl); font-weight: 800; color: var(--color-emerald);">${takeHomePct}%</strong>
            </div>
          </div>

          <!-- Donut Legend -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-xs);">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-elevated); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: var(--radius-full); background: var(--color-emerald);"></span>
                <span>Net Take-Home Pay</span>
              </span>
              <strong>${formatINR(takeHome)} (${takeHomePct}%)</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-elevated); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: var(--radius-full); background: var(--color-rose);"></span>
                <span>Income Tax Payable</span>
              </span>
              <strong>${formatINR(tax)} (${taxPct}%)</strong>
            </div>
          </div>
        </div>

        <!-- Comparative Bar Chart: Tax Liability Head-to-Head -->
        <div class="glass-card" style="background: var(--bg-surface); display: flex; flex-direction: column;">
          <h3 style="font-size: var(--text-base); font-weight: 700; margin-bottom: var(--space-4);">
            <span>📊</span>
            <span>Tax Liability Head-to-Head</span>
          </h3>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: var(--space-5);">
            
            <!-- Old Regime Bar -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: var(--space-1);">
                <span style="font-weight: 600;">Old Tax Regime</span>
                <strong>${formatINR(oldRegime.totalTax)}</strong>
              </div>
              <div style="height: 18px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--border-subtle);">
                <div style="height: 100%; width: ${Math.max(4, Math.min(100, (oldRegime.totalTax / Math.max(1, oldRegime.totalTax, newRegime.totalTax)) * 100))}%; background: ${recommendedRegime === 'OLD' ? 'var(--grad-emerald)' : 'var(--color-rose)'}; border-radius: var(--radius-full); transition: width 500ms ease;"></div>
              </div>
            </div>

            <!-- New Regime Bar -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: var(--space-1);">
                <span style="font-weight: 600;">New Tax Regime</span>
                <strong>${formatINR(newRegime.totalTax)}</strong>
              </div>
              <div style="height: 18px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--border-subtle);">
                <div style="height: 100%; width: ${Math.max(4, Math.min(100, (newRegime.totalTax / Math.max(1, oldRegime.totalTax, newRegime.totalTax)) * 100))}%; background: ${recommendedRegime === 'NEW' ? 'var(--grad-emerald)' : 'var(--color-rose)'}; border-radius: var(--radius-full); transition: width 500ms ease;"></div>
              </div>
            </div>

            <!-- Savings Margin Pill -->
            <div style="padding: var(--space-3); background: var(--color-emerald-bg); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); text-align: center; font-size: var(--text-xs);">
              <span style="color: var(--color-emerald); font-weight: 700;">
                ${comparisonResult.annualSavings > 0 ? `Savings Margin: ${formatINR(comparisonResult.annualSavings)} / year with ${recommendedRegime} Regime` : 'Both regimes result in the exact same tax'}
              </span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  return {
    renderVisualCharts
  };
}));
