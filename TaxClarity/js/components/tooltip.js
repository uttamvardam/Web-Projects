/**
 * TaxClarity - Accessible Tooltip Component
 * Positions and manages contextual information badges for tax sections
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.Tooltip = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Initializes all tooltips in the DOM
   */
  function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    tooltipTriggers.forEach(el => {
      // If tooltip-box not already injected
      if (!el.querySelector('.tooltip-box')) {
        const text = el.getAttribute('data-tooltip');
        const box = document.createElement('span');
        box.className = 'tooltip-box';
        box.textContent = text;
        box.setAttribute('role', 'tooltip');
        el.appendChild(box);
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', text);
      }
    });
  }

  return {
    initTooltips
  };
}));
