/**
 * TaxClarity - Step 4 & Master Results Synchronizer
 * Coordinates Verdict Banner, Optimizer Slider, Comparison Table, Charts, Slab Breakdown, and Action Toolbar
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const VerdictBanner = require('./verdictBanner.js');
    const ComparisonTable = require('./comparisonTable.js');
    const Charts = require('./charts.js');
    const SlabAccordion = require('./slabAccordion.js');
    const OptimizerSlider = require('./optimizerSlider.js');
    const ScenarioManager = require('./scenarioManager.js');
    const URLSerializer = require('../utils/urlSerializer.js');
    module.exports = factory(VerdictBanner, ComparisonTable, Charts, SlabAccordion, OptimizerSlider, ScenarioManager, URLSerializer);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.StepResults = factory(
      root.TaxClarity.VerdictBanner,
      root.TaxClarity.ComparisonTable,
      root.TaxClarity.Charts,
      root.TaxClarity.SlabAccordion,
      root.TaxClarity.OptimizerSlider,
      root.TaxClarity.ScenarioManager,
      root.TaxClarity.URLSerializer
    );
  }
}(typeof self !== 'undefined' ? self : this, function (
  VerdictBanner,
  ComparisonTable,
  Charts,
  SlabAccordion,
  OptimizerSlider,
  ScenarioManager,
  URLSerializer
) {
  'use strict';

  function initStepResults(containerId = 'step4Content') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <!-- Action Toolbar -->
        <div style="display: flex; justify-content: flex-end; gap: var(--space-2); margin-bottom: var(--space-4); flex-wrap: wrap;">
          <button type="button" id="openScenariosBtn" class="btn btn-secondary btn-sm" title="View & save calculation scenarios">
            <span>📁</span>
            <span>Scenarios</span>
          </button>
          <button type="button" id="shareCalculationBtn" class="btn btn-secondary btn-sm" title="Copy private shareable link">
            <span>🔗</span>
            <span>Share Link</span>
          </button>
          <button type="button" id="printReportBtn" class="btn btn-secondary btn-sm" title="Print Tax Breakdown">
            <span>🖨️</span>
            <span>Print / PDF</span>
          </button>
          <button type="button" id="resetCalculatorBtn" class="btn btn-ghost btn-sm" title="Reset all inputs to default">
            <span>🔄</span>
            <span>Reset</span>
          </button>
        </div>

        <!-- 1. Interactive "What-If" Breakeven Optimizer Slider -->
        <div id="optimizerSliderContainer"></div>

        <!-- 2. Interactive SVG Visualizer Charts -->
        <div id="chartsContainer"></div>

        <!-- 3. Slab-by-Slab Breakdown Accordion -->
        <div id="slabAccordionContainer"></div>
      `;

      // Attach Toolbar Actions
      const printBtn = container.querySelector('#printReportBtn');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.print();
        });
      }

      const scenariosBtn = container.querySelector('#openScenariosBtn');
      if (scenariosBtn) {
        scenariosBtn.addEventListener('click', () => {
          const sm = ScenarioManager || (window.TaxClarity && window.TaxClarity.ScenarioManager);
          if (sm) sm.openScenarioModal();
        });
      }

      const shareBtn = container.querySelector('#shareCalculationBtn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          const urlSer = URLSerializer || (window.TaxClarity && window.TaxClarity.URLSerializer);
          if (urlSer) urlSer.copyShareableLink();
        });
      }

      const resetBtn = container.querySelector('#resetCalculatorBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const rm = window.TaxClarity && window.TaxClarity.ResetModal;
          if (rm && typeof rm.openResetModal === 'function') {
            rm.openResetModal();
          } else {
            const Store = window.TaxClarity.Store;
            if (Store) Store.resetState();
          }
        });
      }
    }

    // Global subscriber to update all results containers
    const Store = window.TaxClarity.Store;
    if (Store) {
      Store.subscribe((state) => {
        if (state && state.calculationResults) {
          updateResults(state.calculationResults);
        }
      });
      // Trigger initial render
      const initialState = Store.getState();
      if (initialState && initialState.calculationResults) {
        updateResults(initialState.calculationResults);
      }
    }
  }

  function updateResults(calculationResults) {
    if (!calculationResults) return;

    const VB = VerdictBanner || (window.TaxClarity && window.TaxClarity.VerdictBanner);
    const CT = ComparisonTable || (window.TaxClarity && window.TaxClarity.ComparisonTable);
    const OS = OptimizerSlider || (window.TaxClarity && window.TaxClarity.OptimizerSlider);
    const CH = Charts || (window.TaxClarity && window.TaxClarity.Charts);
    const SA = SlabAccordion || (window.TaxClarity && window.TaxClarity.SlabAccordion);

    // Render into right-column dashboard
    if (VB) VB.renderVerdictBanner(calculationResults, 'verdictBannerContainer');
    if (CT) CT.renderComparisonTable(calculationResults, 'comparisonTableContainer');

    // Render into Step 4 / Detailed view
    if (OS) OS.renderOptimizerSlider(calculationResults, 'optimizerSliderContainer');
    if (CH) CH.renderVisualCharts(calculationResults, 'chartsContainer');
    if (SA) SA.renderSlabAccordion(calculationResults, 'slabAccordionContainer');
  }

  return {
    initStepResults,
    updateResults
  };
}));
