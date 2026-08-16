/**
 * TaxClarity - House Rent Allowance (HRA) Exemption Engine
 * Implements Section 10(13A) of the Indian Income Tax Act
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.HRACalculator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Calculates HRA Exemption under Section 10(13A) (Old Regime only)
   * 
   * @param {Object} params
   * @param {number} params.basicSalary - Annual Basic Salary
   * @param {number} [params.dearnessAllowance=0] - Annual DA forming part of retirement benefits
   * @param {number} params.hraReceived - Annual HRA Received from employer
   * @param {number} params.rentPaid - Annual Rent Paid by employee
   * @param {boolean} [params.isMetro=false] - True if residing in Delhi, Mumbai, Kolkata, Chennai
   * @returns {Object} HRA calculation result and detailed breakdown
   */
  function calculateHRAExemption({
    basicSalary = 0,
    dearnessAllowance = 0,
    hraReceived = 0,
    rentPaid = 0,
    isMetro = false
  } = {}) {
    const basic = Math.max(0, Number(basicSalary) || 0);
    const da = Math.max(0, Number(dearnessAllowance) || 0);
    const hra = Math.max(0, Number(hraReceived) || 0);
    const rent = Math.max(0, Number(rentPaid) || 0);

    const salaryForHra = basic + da;

    // If no rent is paid or no HRA received, no exemption is available
    if (rent <= 0 || hra <= 0 || salaryForHra <= 0) {
      return {
        exemptHRA: 0,
        taxableHRA: hra,
        breakdown: {
          actualHraReceived: hra,
          rentMinusTenPercent: 0,
          salaryPercentageLimit: 0,
          applicablePercentage: isMetro ? 50 : 40,
          winningRule: 'None (Zero rent or HRA)'
        }
      };
    }

    // Condition 1: Actual HRA received
    const cond1 = hra;

    // Condition 2: Rent paid minus 10% of salary
    const tenPercentSalary = 0.10 * salaryForHra;
    const cond2 = Math.max(0, rent - tenPercentSalary);

    // Condition 3: 50% of salary for Metro, 40% for Non-Metro
    const metroPercentage = isMetro ? 0.50 : 0.40;
    const cond3 = metroPercentage * salaryForHra;

    // Exemption is minimum of the three conditions
    const exemptHRA = Math.min(cond1, cond2, cond3);
    const taxableHRA = Math.max(0, hra - exemptHRA);

    let winningRule = 'Actual HRA Received';
    if (exemptHRA === cond2 && cond2 <= cond1 && cond2 <= cond3) {
      winningRule = 'Rent Paid minus 10% of Basic Salary';
    } else if (exemptHRA === cond3 && cond3 <= cond1 && cond3 <= cond2) {
      winningRule = `${isMetro ? '50%' : '40%'} of Basic Salary (${isMetro ? 'Metro' : 'Non-Metro'})`;
    }

    return {
      exemptHRA: Math.round(exemptHRA),
      taxableHRA: Math.round(taxableHRA),
      breakdown: {
        actualHraReceived: Math.round(cond1),
        rentMinusTenPercent: Math.round(cond2),
        salaryPercentageLimit: Math.round(cond3),
        applicablePercentage: isMetro ? 50 : 40,
        winningRule
      }
    };
  }

  return {
    calculateHRAExemption
  };
}));
