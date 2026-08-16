/**
 * TaxClarity - Dedicated Section 87A Rebate & Marginal Relief Calculation Module
 * Provides unified, mathematically verified Section 87A rebate logic for Old & New Regimes (AY 2026-27 & AY 2025-26)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.Section87A = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const OLD_87A_INCOME_LIMIT = 500000;
  const OLD_87A_MAX_REBATE = 12500;

  const NEW_87A_INCOME_LIMIT_2025_26 = 1200000;
  const NEW_87A_MAX_REBATE_2025_26 = 60000;
  const NEW_MARGINAL_RELIEF_LIMIT_2025_26 = 1270588;

  const NEW_87A_INCOME_LIMIT_2024_25 = 700000;
  const NEW_87A_MAX_REBATE_2024_25 = 25000;
  const NEW_MARGINAL_RELIEF_LIMIT_2024_25 = 727777;

  /**
   * Calculate Section 87A Rebate for Old Tax Regime
   * 
   * @param {Object} params
   * @param {number} params.totalIncome - Net taxable income
   * @param {number} params.normalSlabTax - Tax on normal income before rebate
   * @param {boolean} [params.isResident=true] - Whether taxpayer is resident individual
   * @returns {Object} RebateResult
   */
  function calculateOldRegime87A({ totalIncome = 0, normalSlabTax = 0, isResident = true } = {}) {
    const income = Math.max(0, Number(totalIncome) || 0);
    const slabTax = Math.max(0, Number(normalSlabTax) || 0);

    // 87A is only for resident individuals
    if (!isResident) {
      return {
        taxBeforeRebate: slabTax,
        rebate87A: 0,
        taxAfterRebate: slabTax,
        marginalRelief: 0,
        taxAfterRelief: slabTax,
        eligibleFor87A: false,
        reason: 'Section 87A not available to non-resident individuals.'
      };
    }

    // Income above ₹5 lakh gets no Old Regime 87A rebate
    if (income > OLD_87A_INCOME_LIMIT) {
      return {
        taxBeforeRebate: slabTax,
        rebate87A: 0,
        taxAfterRebate: slabTax,
        marginalRelief: 0,
        taxAfterRelief: slabTax,
        eligibleFor87A: false,
        reason: 'Total income exceeds ₹5 lakh.'
      };
    }

    const rebate = Math.min(slabTax, OLD_87A_MAX_REBATE);
    const taxAfterRebate = Math.max(0, slabTax - rebate);
    return {
      taxBeforeRebate: slabTax,
      rebate87A: rebate,
      taxAfterRebate,
      marginalRelief: 0,
      taxAfterRelief: taxAfterRebate,
      eligibleFor87A: true,
      reason: 'Eligible for Old Regime Section 87A rebate.'
    };
  }

  /**
   * Calculate Section 87A Rebate & Marginal Relief for New Tax Regime (Section 115BAC)
   * 
   * @param {Object} params
   * @param {number} params.totalIncome - Net taxable income
   * @param {number} params.normalSlabTax - Tax on normal income before rebate
   * @param {boolean} [params.isResident=true] - Whether taxpayer is resident individual
   * @param {string} [params.financialYear='2025-26'] - Financial Year ('2025-26' or '2024-25')
   * @returns {Object} RebateResult
   */
  function calculateNewRegime87A({ totalIncome = 0, normalSlabTax = 0, isResident = true, financialYear = '2025-26' } = {}) {
    const income = Math.max(0, Number(totalIncome) || 0);
    const slabTax = Math.max(0, Number(normalSlabTax) || 0);

    // 87A / marginal relief is restricted to resident individuals
    if (!isResident) {
      return {
        taxBeforeRebate: slabTax,
        rebate87A: 0,
        taxAfterRebate: slabTax,
        marginalRelief: 0,
        taxAfterRelief: slabTax,
        eligibleFor87A: false,
        reason: 'Section 87A / marginal relief not available to non-resident individuals.'
      };
    }

    const isFY2526 = (financialYear === '2025-26');
    const incomeLimit = isFY2526 ? NEW_87A_INCOME_LIMIT_2025_26 : NEW_87A_INCOME_LIMIT_2024_25;
    const maxRebate = isFY2526 ? NEW_87A_MAX_REBATE_2025_26 : NEW_87A_MAX_REBATE_2024_25;

    // Up to threshold (₹12L for FY 2025-26 / ₹7L for FY 2024-25): normal 87A rebate
    if (income <= incomeLimit) {
      const rebate = Math.min(slabTax, maxRebate);
      const taxAfterRebate = Math.max(0, slabTax - rebate);
      return {
        taxBeforeRebate: slabTax,
        rebate87A: rebate,
        taxAfterRebate,
        marginalRelief: 0,
        taxAfterRelief: taxAfterRebate,
        eligibleFor87A: true,
        reason: `Eligible for New Regime Section 87A rebate (up to ₹${maxRebate.toLocaleString('en-IN')}).`
      };
    }

    // Above threshold: no normal 87A rebate; evaluate marginal relief
    const excessIncome = income - incomeLimit;
    const potentialRelief = slabTax - excessIncome;

    let marginalRelief = 0;
    if (potentialRelief > 0) {
      marginalRelief = potentialRelief;
    }

    const taxAfterRelief = slabTax - marginalRelief;

    return {
      taxBeforeRebate: slabTax,
      rebate87A: 0,
      taxAfterRebate: slabTax,
      marginalRelief: Math.round(marginalRelief),
      taxAfterRelief: Math.round(taxAfterRelief),
      eligibleFor87A: false,
      reason: marginalRelief > 0
        ? `Income exceeds ₹${(incomeLimit / 100000).toFixed(0)} lakh; marginal relief evaluated.`
        : 'Income exceeds marginal-relief range.'
    };
  }

  return {
    OLD_87A_INCOME_LIMIT,
    OLD_87A_MAX_REBATE,
    NEW_87A_INCOME_LIMIT_2025_26,
    NEW_87A_MAX_REBATE_2025_26,
    NEW_MARGINAL_RELIEF_LIMIT_2025_26,
    NEW_87A_INCOME_LIMIT_2024_25,
    NEW_87A_MAX_REBATE_2024_25,
    NEW_MARGINAL_RELIEF_LIMIT_2024_25,
    calculateOldRegime87A,
    calculateNewRegime87A
  };
}));
