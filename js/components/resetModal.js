/**
 * TaxClarity - Reset All Modal & Application State Reset Controller
 * Safely clears all user inputs, restores application defaults, resets derived calculations, and navigates to Step 1
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.ResetModal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let isInitialized = false;

  function initResetModal() {
    if (isInitialized) return;
    isInitialized = true;

    const modalEl = document.getElementById('resetConfirmModal');
    const headerResetBtn = document.getElementById('headerResetBtn');

    if (headerResetBtn) {
      headerResetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openResetModal();
      });
    }

    if (modalEl) {
      const cancelBtn = modalEl.querySelector('#cancelResetBtn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', closeResetModal);
      }

      const confirmBtn = modalEl.querySelector('#confirmResetBtn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          closeResetModal();
          executeFullReset();
        });
      }

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          closeResetModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('resetConfirmModal');
        if (modal && modal.style.display === 'flex') {
          closeResetModal();
        }
      }
    });
  }

  function openResetModal() {
    const modalEl = document.getElementById('resetConfirmModal');
    if (modalEl) {
      modalEl.style.display = 'flex';
      const cancelBtn = modalEl.querySelector('#cancelResetBtn');
      if (cancelBtn) cancelBtn.focus();
    } else {
      // Fallback: If modal markup is not present, execute direct reset
      if (confirm('Reset All Data?\n\nThis will clear all profile, income, deduction, and scenario inputs and return TaxClarity to its default state.')) {
        executeFullReset();
      }
    }
  }

  function closeResetModal() {
    const modalEl = document.getElementById('resetConfirmModal');
    if (modalEl) {
      modalEl.style.display = 'none';
    }
  }

  /**
   * Complete programmatic reset of application state, forms, calculations, URL, and navigation
   */
  function executeFullReset() {
    const TC = window.TaxClarity || {};
    const Store = TC.Store;

    // 1. Reset Store State to Default
    if (Store && typeof Store.resetState === 'function') {
      Store.resetState();
    }

    // 2. Clear URL hash/params without full reload
    if (window.location.hash) {
      try {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
      } catch (e) {
        console.warn('Unable to replace state:', e);
      }
    }

    // 3. Re-initialize Step Views with Fresh Defaults
    if (TC.StepProfile && typeof TC.StepProfile.initStepProfile === 'function') {
      TC.StepProfile.initStepProfile('step1Content');
    }
    if (TC.StepIncome && typeof TC.StepIncome.initStepIncome === 'function') {
      TC.StepIncome.initStepIncome('step2Content');
    }
    if (TC.StepDeductions && typeof TC.StepDeductions.initStepDeductions === 'function') {
      TC.StepDeductions.initStepDeductions('step3Content');
    }
    if (TC.StepResults && typeof TC.StepResults.initStepResults === 'function') {
      TC.StepResults.initStepResults('step4Content');
    }
    if (TC.QuickView && typeof TC.QuickView.initQuickView === 'function') {
      TC.QuickView.initQuickView();
    }

    // 4. Navigate back to Step 1: Profile & FY
    if (TC.WizardStepper && typeof TC.WizardStepper.goToStep === 'function') {
      TC.WizardStepper.goToStep(1);
    }

    // 5. Re-render Right Column Overview
    if (Store) {
      const state = Store.getState();
      if (state && state.calculationResults) {
        if (TC.VerdictBanner && typeof TC.VerdictBanner.renderVerdictBanner === 'function') {
          TC.VerdictBanner.renderVerdictBanner(state.calculationResults, 'verdictBannerContainer');
        }
        if (TC.ComparisonTable && typeof TC.ComparisonTable.renderComparisonTable === 'function') {
          TC.ComparisonTable.renderComparisonTable(state.calculationResults, 'comparisonTableContainer');
        }
      }
    }

    // 6. Refresh Tooltips
    if (TC.Tooltip && typeof TC.Tooltip.initTooltips === 'function') {
      TC.Tooltip.initTooltips();
    }

    // 7. Show Toast Notification
    showToast('✔ TaxClarity reset to default state');
    console.log('✔ TaxClarity state successfully reset to defaults');
  }

  function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-popup';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'flex';

    setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 3000);
  }

  return {
    initResetModal,
    openResetModal,
    closeResetModal,
    executeFullReset,
    showToast
  };
}));
