/**
 * TaxClarity - Step 4: Expandable Tax Slab Breakdown Accordion
 * Displays dual tables detailing bracket-by-bracket math, Section 87A rebate, and marginal relief
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    module.exports = factory(Formatters);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.SlabAccordion = factory(root.TaxClarity.Formatters);
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters) {
  'use strict';

  const { formatINR } = Formatters;

  function renderSlabAccordion(comparisonResult, containerId = 'slabAccordionContainer') {
    const container = document.getElementById(containerId);
    if (!container || !comparisonResult) return;

    const { oldRegime, newRegime } = comparisonResult;

    container.innerHTML = `
      <div class="glass-card" style="padding: 0; overflow: hidden; background: var(--bg-card); margin-top: var(--space-4);">
        <!-- Accordion Header Button -->
        <button type="button" id="toggleSlabAccordionBtn" style="width: 100%; padding: var(--space-4) var(--space-6); background: transparent; border: none; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left;">
          <div>
            <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <span>🧮</span>
              <span>Inspect Slab-by-Slab Tax Calculation Breakdown</span>
            </h3>
            <p class="form-hint">See how every rupee is taxed across brackets in both Old & New regimes</p>
          </div>
          <span id="slabAccordionChevron" style="font-size: var(--text-base); color: var(--color-primary); transition: transform var(--transition-fast);">
            ▼
          </span>
        </button>

        <!-- Accordion Content (Collapsed by default) -->
        <div id="slabAccordionContent" style="display: none; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--border-card);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6);">
            
            <!-- Old Regime Slabs Table -->
            <div>
              <h4 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--space-3); color: var(--text-main); display: flex; justify-content: space-between;">
                <span>Old Regime Slabs</span>
                <span style="font-weight: 600;">Taxable: ${formatINR(oldRegime.netTaxableIncome)}</span>
              </h4>

              <table style="width: 100%; border-collapse: collapse; font-size: var(--text-xs);">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-card); color: var(--text-muted);">
                    <th style="padding: 6px 0; text-align: left;">Income Bracket</th>
                    <th style="padding: 6px 0; text-align: center;">Rate</th>
                    <th style="padding: 6px 0; text-align: right;">Tax Computed</th>
                  </tr>
                </thead>
                <tbody>
                  ${oldRegime.slabBreakdown.map(slab => `
                    <tr style="border-bottom: 1px solid var(--border-card);">
                      <td style="padding: 6px 0;">${slab.label}</td>
                      <td style="padding: 6px 0; text-align: center; color: var(--text-muted);">${(slab.rate * 100).toFixed(0)}%</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: 600;">${formatINR(slab.taxAmount)}</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top: 2px solid var(--border-card); font-weight: 700;">
                    <td style="padding: 8px 0;" colspan="2">Tax Before Rebate</td>
                    <td style="padding: 8px 0; text-align: right;">${formatINR(oldRegime.taxBeforeRebate)}</td>
                  </tr>
                  <tr style="color: var(--color-emerald);">
                    <td style="padding: 4px 0;" colspan="2">Less: Section 87A Rebate</td>
                    <td style="padding: 4px 0; text-align: right;">${oldRegime.rebate87A > 0 ? `- ${formatINR(oldRegime.rebate87A)}` : '₹ 0'}</td>
                  </tr>
                  <tr style="color: var(--text-body);">
                    <td style="padding: 4px 0;" colspan="2">Tax After Rebate</td>
                    <td style="padding: 4px 0; text-align: right;">${formatINR(oldRegime.taxAfterRebate)}</td>
                  </tr>
                  <tr style="color: var(--color-emerald);">
                    <td style="padding: 4px 0;" colspan="2">Less: Marginal Relief</td>
                    <td style="padding: 4px 0; text-align: right;">${oldRegime.marginalRelief87A > 0 ? `- ${formatINR(oldRegime.marginalRelief87A)}` : '₹ 0'}</td>
                  </tr>
                  <tr style="color: var(--text-body); font-weight: 600;">
                    <td style="padding: 4px 0;" colspan="2">Tax After Relief</td>
                    <td style="padding: 4px 0; text-align: right;">${formatINR(oldRegime.taxAfterRelief)}</td>
                  </tr>
                  <tr style="color: var(--text-muted);">
                    <td style="padding: 4px 0;" colspan="2">Add: 4% Health & Education Cess</td>
                    <td style="padding: 4px 0; text-align: right;">+ ${formatINR(oldRegime.cess)}</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-card); font-weight: 800; font-size: var(--text-sm);">
                    <td style="padding: 8px 0;" colspan="2">Final Tax Payable</td>
                    <td style="padding: 8px 0; text-align: right; color: var(--text-main);">${formatINR(oldRegime.totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- New Regime Slabs Table -->
            <div>
              <h4 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--space-3); color: var(--text-main); display: flex; justify-content: space-between;">
                <span>New Regime Slabs (Sec 115BAC)</span>
                <span style="font-weight: 600;">Taxable: ${formatINR(newRegime.netTaxableIncome)}</span>
              </h4>

              <table style="width: 100%; border-collapse: collapse; font-size: var(--text-xs);">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-card); color: var(--text-muted);">
                    <th style="padding: 6px 0; text-align: left;">Income Bracket</th>
                    <th style="padding: 6px 0; text-align: center;">Rate</th>
                    <th style="padding: 6px 0; text-align: right;">Tax Computed</th>
                  </tr>
                </thead>
                <tbody>
                  ${newRegime.slabBreakdown.map(slab => `
                    <tr style="border-bottom: 1px solid var(--border-card);">
                      <td style="padding: 6px 0;">${slab.label}</td>
                      <td style="padding: 6px 0; text-align: center; color: var(--text-muted);">${(slab.rate * 100).toFixed(0)}%</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: 600;">${formatINR(slab.taxAmount)}</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top: 2px solid var(--border-card); font-weight: 700;">
                    <td style="padding: 8px 0;" colspan="2">Tax Before Rebate</td>
                    <td style="padding: 8px 0; text-align: right;">${formatINR(newRegime.taxBeforeRebate)}</td>
                  </tr>
                  <tr style="color: var(--color-emerald);">
                    <td style="padding: 4px 0;" colspan="2">Less: Section 87A Rebate</td>
                    <td style="padding: 4px 0; text-align: right;">${newRegime.rebate87A > 0 ? `- ${formatINR(newRegime.rebate87A)}` : '₹ 0'}</td>
                  </tr>
                  <tr style="color: var(--text-body);">
                    <td style="padding: 4px 0;" colspan="2">Tax After Rebate</td>
                    <td style="padding: 4px 0; text-align: right;">${formatINR(newRegime.taxAfterRebate)}</td>
                  </tr>
                  <tr style="color: var(--color-emerald);">
                    <td style="padding: 4px 0;" colspan="2">Less: Marginal Relief</td>
                    <td style="padding: 4px 0; text-align: right;">${newRegime.marginalRelief87A > 0 ? `- ${formatINR(newRegime.marginalRelief87A)}` : '₹ 0'}</td>
                  </tr>
                  <tr style="color: var(--text-body); font-weight: 600;">
                    <td style="padding: 4px 0;" colspan="2">Tax After Relief</td>
                    <td style="padding: 4px 0; text-align: right;">${formatINR(newRegime.taxAfterRelief)}</td>
                  </tr>
                  <tr style="color: var(--text-muted);">
                    <td style="padding: 4px 0;" colspan="2">Add: 4% Health & Education Cess</td>
                    <td style="padding: 4px 0; text-align: right;">+ ${formatINR(newRegime.cess)}</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-card); font-weight: 800; font-size: var(--text-sm);">
                    <td style="padding: 8px 0;" colspan="2">Final Tax Payable</td>
                    <td style="padding: 8px 0; text-align: right; color: var(--text-main);">${formatINR(newRegime.totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    `;

    bindAccordionEvents(container);
  }

  function bindAccordionEvents(container) {
    const toggleBtn = container.querySelector('#toggleSlabAccordionBtn');
    const content = container.querySelector('#slabAccordionContent');
    const chevron = container.querySelector('#slabAccordionChevron');

    if (toggleBtn && content) {
      let isOpen = false;
      toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        content.style.display = isOpen ? 'block' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }
  }

  return {
    renderSlabAccordion
  };
}));
