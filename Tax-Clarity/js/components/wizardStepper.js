/**
 * TaxClarity - 4-Step Wizard Stepper & Mode Switcher Shell
 * Controls Step 1-4 Navigation, Stepper Progress Indicator, and Quick Single-Page View Mode
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.WizardStepper = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TOTAL_STEPS = 4;
  let currentStep = 1;
  let isQuickMode = false;
  const onStepChangeCallbacks = [];

  /**
   * Initialize Stepper Event Listeners
   */
  function initStepper() {
    // Step item direct clicks
    const stepButtons = document.querySelectorAll('[data-step-target]');
    stepButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetStep = parseInt(btn.getAttribute('data-step-target'), 10);
        if (!isNaN(targetStep) && targetStep >= 1 && targetStep <= TOTAL_STEPS) {
          goToStep(targetStep);
        }
      });
    });

    // Next button
    const nextBtns = document.querySelectorAll('.js-next-step');
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < TOTAL_STEPS) {
          goToStep(currentStep + 1);
        }
      });
    });

    // Prev button
    const prevBtns = document.querySelectorAll('.js-prev-step');
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      });
    });

    // Quick Mode Switcher Toggle
    const modeToggle = document.getElementById('viewModeToggle');
    if (modeToggle) {
      modeToggle.addEventListener('change', (e) => {
        setQuickMode(e.target.checked);
      });
    }

    updateView();
  }

  /**
   * Navigate to a specific step
   * @param {number} stepNumber - 1 to 4
   */
  function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > TOTAL_STEPS) return;
    currentStep = stepNumber;
    updateView();

    // Scroll to the calculator section smoothly (keeps user at calculator, not hero banner)
    const targetAnchor = document.getElementById('calculatorSection') || document.querySelector('.calculator-utility-toolbar') || document.querySelector('.wizard-stepper');
    if (targetAnchor) {
      const navOffset = 20;
      const targetPos = targetAnchor.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }

    // Notify listeners
    onStepChangeCallbacks.forEach(cb => cb(currentStep));
  }

  /**
   * Update visual states of steps, tracks, and view containers
   */
  function updateView() {
    if (isQuickMode) return;

    // Update Step items
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach((item, index) => {
      const stepIdx = index + 1;
      const bubble = item.querySelector('.step-bubble');
      item.classList.remove('active', 'completed');
      if (stepIdx === currentStep) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'step');
        if (bubble) bubble.textContent = stepIdx;
      } else if (stepIdx < currentStep) {
        item.classList.add('completed');
        item.removeAttribute('aria-current');
        if (bubble) bubble.textContent = '✓';
      } else {
        item.removeAttribute('aria-current');
        if (bubble) bubble.textContent = stepIdx;
      }
    });

    // Update Track Fill Percentage
    const trackFill = document.querySelector('.stepper-track-fill');
    if (trackFill) {
      const percentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
      trackFill.style.width = `${percentage}%`;
    }

    // Update Step View Panels
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const viewEl = document.getElementById(`step${i}View`);
      if (viewEl) {
        if (i === currentStep) {
          viewEl.classList.add('active');
        } else {
          viewEl.classList.remove('active');
        }
      }
    }
  }

  /**
   * Enable/Disable Quick Single-Page View Mode
   * @param {boolean} enabled 
   */
  function setQuickMode(enabled) {
    isQuickMode = Boolean(enabled);
    const wizardContainer = document.getElementById('wizardFlowContainer');
    const quickContainer = document.getElementById('quickFlowContainer');
    const stepperBar = document.querySelector('.wizard-stepper');

    if (isQuickMode) {
      if (wizardContainer) wizardContainer.style.display = 'none';
      if (stepperBar) stepperBar.style.display = 'none';
      if (quickContainer) quickContainer.classList.add('active');
    } else {
      if (wizardContainer) wizardContainer.style.display = 'block';
      if (stepperBar) stepperBar.style.display = 'flex';
      if (quickContainer) quickContainer.classList.remove('active');
      updateView();
    }
  }

  function onStepChange(callback) {
    if (typeof callback === 'function') {
      onStepChangeCallbacks.push(callback);
    }
  }

  return {
    initStepper,
    goToStep,
    setQuickMode,
    getCurrentStep: () => currentStep,
    isQuickMode: () => isQuickMode,
    onStepChange
  };
}));
