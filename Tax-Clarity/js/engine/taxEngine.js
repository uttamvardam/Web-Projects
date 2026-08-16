/**
 * TaxClarity - Master Tax Engine & Regime Comparator
 * Coordinates Old vs New regime calculations, generates recommendation verdict, and computes breakeven optimizer
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Constants = require('../constants.js');
    const HRACalculator = require('./hraCalculator.js');
    const DeductionsCalculator = require('./deductionsCalculator.js');
    const SurchargeCalculator = require('./surchargeCalculator.js');
    const OldRegimeCalculator = require('./oldRegimeCalculator.js');
    const NewRegimeCalculator = require('./newRegimeCalculator.js');
    module.exports = factory(
      Constants,
      HRACalculator,
      DeductionsCalculator,
      SurchargeCalculator,
      OldRegimeCalculator,
      NewRegimeCalculator
    );
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.TaxEngine = factory(
      root.TaxClarity.Constants,
      root.TaxClarity.HRACalculator,
      root.TaxClarity.DeductionsCalculator,
      root.TaxClarity.SurchargeCalculator,
      root.TaxClarity.OldRegimeCalculator,
      root.TaxClarity.NewRegimeCalculator
    );
  }
}(typeof self !== 'undefined' ? self : this, function (
  Constants,
  HRACalculator,
  DeductionsCalculator,
  SurchargeCalculator,
  OldRegimeCalculator,
  NewRegimeCalculator
) {
  'use strict';

  /**
   * Compare Old vs New Tax Regimes for a given user profile, income, and deductions
   * 
   * @param {Object} input
   * @param {Object} input.income - Income details
   * @param {Object} input.deductions - Deductions details
   * @param {Object} input.profile - Profile details (ageCategory, employmentType, isMetro)
   * @param {string} [input.financialYear='2024-25'] - Financial Year
   * @returns {Object} Comprehensive side-by-side comparison and recommendation
   */
  function compareRegimes({
    income = {},
    deductions = {},
    profile = {},
    financialYear = '2024-25'
  } = {}) {
    const oldRegimeResult = OldRegimeCalculator.calculateOldRegimeTax(income, deductions, profile, financialYear);
    const newRegimeResult = NewRegimeCalculator.calculateNewRegimeTax(income, deductions, profile, financialYear);

    const oldTax = oldRegimeResult.totalTax;
    const newTax = newRegimeResult.totalTax;
    const taxDifference = Math.abs(oldTax - newTax);

    let recommendedRegime = 'EQUAL';
    let verdictHeadline = 'Both regimes result in the exact same tax liability.';
    let verdictDetails = 'You can opt for either regime without any financial difference in tax payable.';

    if (newTax < oldTax) {
      recommendedRegime = 'NEW';
      verdictHeadline = `New Tax Regime saves you ₹${taxDifference.toLocaleString('en-IN')} per year!`;
      verdictDetails = `By choosing the New Regime, you get a higher standard deduction of ₹75,000 and lower slab rates, giving you ₹${Math.round(taxDifference / 12).toLocaleString('en-IN')} extra in-hand every month.`;
    } else if (oldTax < newTax) {
      recommendedRegime = 'OLD';
      verdictHeadline = `Old Tax Regime saves you ₹${taxDifference.toLocaleString('en-IN')} per year!`;
      verdictDetails = `Your tax exemptions and deductions (HRA, 80C, 80D, Home Loan Interest) lower your taxable income enough to beat the New Regime by ₹${Math.round(taxDifference / 12).toLocaleString('en-IN')} per month.`;
    }

    // Breakeven deduction calculation
    const breakevenInfo = calculateBreakevenDeductions({
      income,
      deductions,
      profile,
      financialYear,
      oldResult: oldRegimeResult,
      newResult: newRegimeResult
    });

    return {
      financialYear,
      recommendedRegime,
      annualSavings: taxDifference,
      monthlySavings: Math.round(taxDifference / 12),
      verdictHeadline,
      verdictDetails,
      oldRegime: oldRegimeResult,
      newRegime: newRegimeResult,
      breakeven: breakevenInfo,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculates the exact additional Old Regime deduction needed to beat or match the New Regime
   */
  function calculateBreakevenDeductions({
    income = {},
    deductions = {},
    profile = {},
    financialYear = '2024-25',
    oldResult = null,
    newResult = null
  } = {}) {
    const oldRes = oldResult || OldRegimeCalculator.calculateOldRegimeTax(income, deductions, profile, financialYear);
    const newRes = newResult || NewRegimeCalculator.calculateNewRegimeTax(income, deductions, profile, financialYear);

    // If Old regime is already winning or both are 0
    if (oldRes.totalTax <= newRes.totalTax) {
      return {
        isOldRegimeBetter: true,
        additionalDeductionsNeeded: 0,
        currentDeductions: oldRes.totalDeductions,
        targetTotalDeductions: oldRes.totalDeductions,
        message: 'Old Regime is currently more beneficial with your existing deductions.'
      };
    }

    if (newRes.totalTax === 0) {
      // Find deductions needed to bring Old Regime taxable income down to ₹5,00,000 (87A rebate)
      const targetTaxable = 500000;
      const targetDeductions = Math.max(0, oldRes.grossTotalIncome - targetTaxable);
      const additionalNeeded = Math.max(0, targetDeductions - oldRes.totalDeductions);

      return {
        isOldRegimeBetter: false,
        additionalDeductionsNeeded: Math.round(additionalNeeded),
        currentDeductions: oldRes.totalDeductions,
        targetTotalDeductions: Math.round(targetDeductions),
        message: `You need ₹${Math.round(additionalNeeded).toLocaleString('en-IN')} more in deductions to bring Old Regime tax to ₹0.`
      };
    }

    // Binary search for exact deduction that brings old tax down to <= new tax
    let low = 0;
    let high = Math.max(100000, oldRes.grossTotalIncome);
    let bestAdditional = high;

    const baseOtherDeductions = Number(deductions.otherDeductions) || 0;

    for (let iter = 0; iter < 30; iter++) {
      const mid = Math.round((low + high) / 2);
      const testDeductions = {
        ...deductions,
        otherDeductions: baseOtherDeductions + mid
      };

      const testOld = OldRegimeCalculator.calculateOldRegimeTax(income, testDeductions, profile, financialYear);
      if (testOld.totalTax <= newRes.totalTax) {
        bestAdditional = mid;
        high = mid - 1; // Try to find smaller additional deduction
      } else {
        low = mid + 1;
      }
    }

    return {
      isOldRegimeBetter: false,
      additionalDeductionsNeeded: Math.round(bestAdditional),
      currentDeductions: oldRes.totalDeductions,
      targetTotalDeductions: Math.round(oldRes.totalDeductions + bestAdditional),
      message: `You need ₹${Math.round(bestAdditional).toLocaleString('en-IN')} in additional investments / deductions to make the Old Regime cheaper.`
    };
  }

  return {
    compareRegimes,
    calculateBreakevenDeductions,
    calculateOldRegimeTax: OldRegimeCalculator.calculateOldRegimeTax,
    calculateNewRegimeTax: NewRegimeCalculator.calculateNewRegimeTax,
    calculateHRAExemption: HRACalculator.calculateHRAExemption,
    calculateDeductions: DeductionsCalculator.calculateDeductions,
    calculateSurchargeAndCess: SurchargeCalculator.calculateSurchargeAndCess
  };
}));
