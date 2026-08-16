/**
 * TaxClarity - Multi-Scenario LocalStorage Persistence Manager
 * Allows users to save, compare, switch between, export, and import multiple tax calculation scenarios
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Formatters = require('../utils/formatters.js');
    module.exports = factory(Formatters);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.ScenarioManager = factory(root.TaxClarity.Formatters);
  }
}(typeof self !== 'undefined' ? self : this, function (Formatters) {
  'use strict';

  const STORAGE_KEY = 'taxclarity_saved_scenarios';
  const { formatINR } = Formatters;

  function getScenarios() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading scenarios from localStorage:', e);
      return [];
    }
  }

  function saveScenarios(scenarios) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    } catch (e) {
      console.error('Error saving scenarios to localStorage:', e);
    }
  }

  function initScenarioManager() {
    let modalEl = document.getElementById('scenarioModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'scenarioModal';
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

    renderModalContent(modalEl);
  }

  function renderModalContent(modalEl) {
    const scenarios = getScenarios();

    modalEl.innerHTML = `
      <div class="glass-card glass-card-elevated" style="max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
        <button id="closeScenarioModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted);">
          ✕
        </button>

        <div style="margin-bottom: var(--space-4);">
          <h3 style="font-size: var(--text-xl); display: flex; align-items: center; gap: 8px;">
            <span>📁</span>
            <span>Saved Tax Scenarios</span>
          </h3>
          <p class="form-hint">Save and compare different income, HRA, and investment profiles locally in your browser.</p>
        </div>

        <!-- Save Current Form -->
        <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6);">
          <label class="form-label" for="newScenarioTitleInput" style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; margin-bottom: var(--space-2);">
            Save Current Calculation:
          </label>
          <div style="display: flex; gap: var(--space-2);">
            <input type="text" id="newScenarioTitleInput" class="form-input" placeholder="e.g. Baseline CTC + NPS" style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 12px; font-size: var(--text-sm);">
            <button type="button" id="saveScenarioBtn" class="btn btn-primary btn-sm">
              Save Scenario
            </button>
          </div>
        </div>

        <!-- List of Saved Scenarios -->
        <div style="margin-bottom: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-secondary);">Your Saved Scenarios (${scenarios.length})</h4>
            ${scenarios.length > 0 ? `
              <button type="button" id="exportScenariosBtn" class="btn btn-ghost btn-sm" style="font-size: 11px;">
                📥 Export JSON
              </button>
            ` : ''}
          </div>

          ${scenarios.length === 0 ? `
            <div style="text-align: center; padding: var(--space-8) 0; color: var(--text-muted); font-size: var(--text-sm);">
              No scenarios saved yet. Enter a name above to save your first calculation!
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${scenarios.map(sc => `
                <div class="glass-card" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                  <div>
                    <strong style="font-size: var(--text-sm); color: var(--text-primary); display: block;">${sc.title}</strong>
                    <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
                      <span>FY ${sc.profile.financialYear}</span> • 
                      <span>Gross: ${formatINR(sc.income.grossSalary)}</span> • 
                      <span style="color: var(--color-emerald); font-weight: 600;">${sc.verdictSummary}</span>
                    </div>
                  </div>
                  <div style="display: flex; gap: var(--space-2);">
                    <button type="button" class="btn btn-primary btn-sm" data-load-scenario="${sc.id}">
                      Load
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" data-delete-scenario="${sc.id}" style="color: var(--color-rose);">
                      Delete
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div style="font-size: 11px; color: var(--text-muted); text-align: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-3);">
          🔒 All scenarios are saved strictly in your local browser storage. Zero data leaves your machine.
        </div>
      </div>
    `;

    bindScenarioEvents(modalEl);
  }

  function openScenarioModal() {
    const modalEl = document.getElementById('scenarioModal');
    if (!modalEl) initScenarioManager();
    const modal = document.getElementById('scenarioModal');
    if (modal) {
      renderModalContent(modal);
      modal.style.display = 'flex';
    }
  }

  function closeScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    if (modal) modal.style.display = 'none';
  }

  function bindScenarioEvents(modalEl) {
    // Close
    modalEl.querySelector('#closeScenarioModalBtn').addEventListener('click', closeScenarioModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeScenarioModal();
    });

    // Save
    const saveBtn = modalEl.querySelector('#saveScenarioBtn');
    const titleInput = modalEl.querySelector('#newScenarioTitleInput');
    if (saveBtn && titleInput) {
      saveBtn.addEventListener('click', () => {
        const title = titleInput.value.trim() || `Scenario ${new Date().toLocaleDateString('en-IN')}`;
        const Store = window.TaxClarity.Store;
        if (!Store) return;

        const state = Store.getState();
        const results = state.calculationResults;
        const verdictSummary = results 
          ? (results.recommendedRegime === 'EQUAL' ? 'Regimes Equal' : `${results.recommendedRegime} saves ${formatINR(results.annualSavings)}`)
          : '';

        const newScenario = {
          id: 'sc_' + Date.now(),
          title,
          createdAt: new Date().toISOString(),
          verdictSummary,
          profile: state.profile,
          income: state.income,
          deductions: state.deductions
        };

        const scenarios = getScenarios();
        scenarios.unshift(newScenario);
        saveScenarios(scenarios);
        renderModalContent(modalEl);
      });
    }

    // Load Buttons
    modalEl.querySelectorAll('[data-load-scenario]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-load-scenario');
        const scenarios = getScenarios();
        const found = scenarios.find(s => s.id === id);
        if (found) {
          const Store = window.TaxClarity.Store;
          if (Store) {
            Store.loadScenarioState({
              profile: found.profile,
              income: found.income,
              deductions: found.deductions
            });

            // Re-render forms
            if (window.TaxClarity.StepProfile) window.TaxClarity.StepProfile.initStepProfile('step1Content');
            if (window.TaxClarity.StepIncome) window.TaxClarity.StepIncome.initStepIncome('step2Content');
            if (window.TaxClarity.StepDeductions) window.TaxClarity.StepDeductions.initStepDeductions('step3Content');
          }
          closeScenarioModal();
        }
      });
    });

    // Delete Buttons
    modalEl.querySelectorAll('[data-delete-scenario]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-scenario');
        let scenarios = getScenarios();
        scenarios = scenarios.filter(s => s.id !== id);
        saveScenarios(scenarios);
        renderModalContent(modalEl);
      });
    });

    // Export JSON
    const exportBtn = modalEl.querySelector('#exportScenariosBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const scenarios = getScenarios();
        const blob = new Blob([JSON.stringify(scenarios, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taxclarity_scenarios_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  return {
    initScenarioManager,
    openScenarioModal,
    closeScenarioModal,
    getScenarios
  };
}));
