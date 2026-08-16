/**
 * TaxClarity - Surcharge, Surcharge Marginal Relief & Cess Engine
 * Implements Surcharge rules, Marginal Relief thresholds, and 4% Health & Education Cess
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Constants = require('../constants.js');
    module.exports = factory(Constants);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.SurchargeCalculator = factory(root.TaxClarity.Constants);
  }
}(typeof self !== 'undefined' ? self : this, function (Constants) {
  'use strict';

  const { SURCHARGE_BRACKETS, CESS_RATE } = Constants;

  /**
   * Determine nominal surcharge rate for a given taxable income and regime
   * 
   * @param {number} taxableIncome 
   * @param {string} regime - 'OLD' or 'NEW'
   * @returns {Object} { rate, thresholdMin, thresholdLabel }
   */
  function getSurchargeRate(taxableIncome, regime = 'NEW') {
    const income = Math.max(0, Number(taxableIncome) || 0);

    for (let i = SURCHARGE_BRACKETS.length - 1; i >= 0; i--) {
      const bracket = SURCHARGE_BRACKETS[i];
      if (income > bracket.min) {
        const rate = (regime === 'NEW') ? bracket.newRate : bracket.oldRate;
        return {
          rate,
          thresholdMin: bracket.min,
          thresholdLabel: bracket.label,
          hasSurcharge: true
        };
      }
    }

    return {
      rate: 0,
      thresholdMin: 0,
      thresholdLabel: 'No Surcharge (Income ≤ ₹50 Lakh)',
      hasSurcharge: false
    };
  }

  /**
   * Calculate Surcharge, Marginal Relief on Surcharge, and Health & Education Cess
   * Accepts either an options object or positional arguments (taxableIncome, baseTaxAfterRebate, regime, computeBaseTaxAtThreshold)
   */
  function calculateSurchargeAndCess(arg1, arg2, arg3, arg4) {
    let taxableIncome = 0;
    let baseTaxAfterRebate = 0;
    let regime = 'NEW';
    let computeBaseTaxAtThreshold = null;

    if (typeof arg1 === 'object' && arg1 !== null) {
      taxableIncome = arg1.taxableIncome || 0;
      baseTaxAfterRebate = arg1.baseTaxAfterRebate || 0;
      regime = arg1.regime || 'NEW';
      computeBaseTaxAtThreshold = arg1.computeBaseTaxAtThreshold || null;
    } else {
      taxableIncome = arg1 || 0;
      baseTaxAfterRebate = arg2 || 0;
      regime = arg3 || 'NEW';
      computeBaseTaxAtThreshold = arg4 || null;
    }

    const income = Math.max(0, Number(taxableIncome) || 0);
    const baseTax = Math.max(0, Number(baseTaxAfterRebate) || 0);

    const { rate: surchargeRate, thresholdMin, thresholdLabel, hasSurcharge } = getSurchargeRate(income, regime);

    if (!hasSurcharge || surchargeRate === 0 || baseTax === 0) {
      const cess = Math.round(baseTax * CESS_RATE);
      const totalTax = baseTax + cess;

      return {
        surchargeRate: 0,
        nominalSurcharge: 0,
        marginalRelief: 0,
        marginalReliefSurcharge: 0,
        finalSurcharge: 0,
        cess,
        totalTax,
        surchargeLabel: thresholdLabel,
        hasSurcharge: false
      };
    }

    const nominalSurcharge = Math.round(baseTax * surchargeRate);
    let marginalRelief = 0;

    // Marginal relief on surcharge
    const prevBracketInfo = getSurchargeRate(thresholdMin, regime);
    let baseTaxAtThreshold = 0;

    if (typeof computeBaseTaxAtThreshold === 'function') {
      baseTaxAtThreshold = computeBaseTaxAtThreshold(thresholdMin);
    } else {
      // Estimated base tax at threshold based on ratio if callback not provided
      baseTaxAtThreshold = (thresholdMin / income) * baseTax;
    }

    const surchargeAtThreshold = Math.round(baseTaxAtThreshold * prevBracketInfo.rate);
    const totalLiabilityAtThreshold = baseTaxAtThreshold + surchargeAtThreshold;

    const excessIncome = income - thresholdMin;
    const maxAllowedLiability = totalLiabilityAtThreshold + excessIncome;
    const currentLiabilityBeforeRelief = baseTax + nominalSurcharge;

    if (currentLiabilityBeforeRelief > maxAllowedLiability) {
      marginalRelief = Math.max(0, currentLiabilityBeforeRelief - maxAllowedLiability);
    }

    const finalSurcharge = Math.max(0, Math.round(nominalSurcharge - marginalRelief));
    const taxPlusSurcharge = baseTax + finalSurcharge;
    const cess = Math.round(taxPlusSurcharge * CESS_RATE);
    const totalTax = taxPlusSurcharge + cess;

    return {
      surchargeRate,
      nominalSurcharge,
      marginalRelief: Math.round(marginalRelief),
      marginalReliefSurcharge: Math.round(marginalRelief),
      finalSurcharge,
      cess,
      totalTax,
      surchargeLabel: thresholdLabel,
      hasSurcharge: true
    };
  }

  return {
    getSurchargeRate,
    calculateSurchargeAndCess
  };
}));
