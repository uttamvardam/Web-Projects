/**
 * TaxClarity - New Tax Regime Calculation Engine (Section 115BAC)
 * Implements Official AY 2026-27 / AY 2025-26 Slabs, ₹75k Standard Deduction, Section 87A Full Rebate & Marginal Relief
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Constants = require('../constants.js');
    const DeductionsCalc = require('./deductionsCalculator.js');
    const SurchargeCalc = require('./surchargeCalculator.js');
    const Section87A = require('./section87a.js');
    module.exports = factory(Constants, DeductionsCalc, SurchargeCalc, Section87A);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.NewRegimeCalculator = factory(
      root.TaxClarity.Constants,
      root.TaxClarity.DeductionsCalculator,
      root.TaxClarity.SurchargeCalculator,
      root.TaxClarity.Section87A
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, DeductionsCalc, SurchargeCalc, Section87A) {
  'use strict';

  const { EMPLOYMENT_TYPES, getNewRegimeSlabs } = Constants;

  /**
   * Helper to compute base slab tax for any taxable income under New Regime slabs for a given FY
   * 
   * @param {number} taxableIncome 
   * @param {string} [financialYear='2025-26']
   * @returns {Object} { baseTax, slabBreakdown }
   */
  function computeNewRegimeBaseTaxForIncome(taxableIncome, financialYear = '2025-26') {
    const income = Math.max(0, Number(taxableIncome) || 0);
    const slabs = getNewRegimeSlabs(financialYear);
    let totalBaseTax = 0;
    const slabBreakdown = [];

    for (const slab of slabs) {
      if (income > slab.min) {
        const taxableInSlab = Math.min(income, slab.max) - slab.min;
        const taxForSlab = Math.round(taxableInSlab * slab.rate);
        totalBaseTax += taxForSlab;

        slabBreakdown.push({
          label: slab.label,
          rate: slab.rate,
          taxableAmount: Math.round(taxableInSlab),
          taxAmount: taxForSlab
        });
      } else {
        slabBreakdown.push({
          label: slab.label,
          rate: slab.rate,
          taxableAmount: 0,
          taxAmount: 0
        });
      }
    }

    return {
      baseTax: totalBaseTax,
      slabBreakdown
    };
  }

  /**
   * Calculate complete tax liability under New Tax Regime (Section 115BAC)
   * 
   * @param {Object} income - Income details
   * @param {Object} deductions - Deduction inputs (Standard Deduction & 80CCD(2))
   * @param {Object} profile - User profile (employmentType, financialYear, isResident)
   * @param {string} [financialYear='2025-26'] - Selected Financial Year
   * @returns {Object} Comprehensive calculation results
   */
  function calculateNewRegimeTax(income = {}, deductions = {}, profile = {}, financialYear = '2025-26') {
    const employmentType = profile.employmentType || EMPLOYMENT_TYPES.SALARIED;
    const isResident = (profile.isResident !== false && profile.residencyStatus !== 'non_resident');

    // 1. Gross Total Income Calculation
    const grossSalary = Math.max(0, Number(income.grossSalary) || 0);
    const basicSalary = Math.max(0, Number(income.basicSalary) || 0);
    const hraReceived = Math.max(0, Number(income.hraReceived) || 0);
    const specialAllowance = Math.max(0, Number(income.specialAllowance) || 0);
    const otherAllowances = Math.max(0, Number(income.otherAllowances) || Number(income.bonus) || 0);

    const salaryIncome = (income.salaryMode === 'detailed')
      ? (basicSalary + hraReceived + specialAllowance + otherAllowances)
      : grossSalary;

    const rentalIncome = Math.max(0, Number(income.rentalIncome) || 0);
    const municipalTaxes = Math.max(0, Number(income.municipalTaxes) || 0);
    const netRentalValue = Math.max(0, rentalIncome - municipalTaxes);
    const standardDedOnRent = Math.round(netRentalValue * 0.30);
    const letOutIncome = netRentalValue - standardDedOnRent;

    const savingsInterest = Math.max(0, Number(income.savingsInterest) || 0);
    const fdInterest = Math.max(0, Number(income.fdInterest) || 0);
    const dividendIncome = Math.max(0, Number(income.dividendIncome) || 0);
    const capitalGains = Math.max(0, Number(income.capitalGains) || 0);
    const businessIncome = Math.max(0, Number(income.businessIncome) || 0);
    const familyPension = Math.max(0, Number(income.familyPension) || 0);
    const otherIncome = Math.max(0, Number(income.otherIncome) || 0);

    const otherSourcesIncome = savingsInterest + fdInterest + dividendIncome + familyPension + otherIncome;
    const grossTotalIncome = salaryIncome + letOutIncome + otherSourcesIncome + capitalGains + businessIncome;

    // 2. Allowed Deductions (Std Ded + 80CCD(2) + Family Pension)
    const deductionResults = DeductionsCalc.calculateDeductions(deductions, profile, income, financialYear);
    const newDeductions = deductionResults.newRegime;

    // 3. Net Taxable Income (Taxable / Total Income after eligible deductions)
    const netTaxableIncome = Math.max(0, grossTotalIncome - newDeductions.totalDeductions);

    // 4. Compute Normal Slab Tax across official slabs for the FY
    const { baseTax, slabBreakdown } = computeNewRegimeBaseTaxForIncome(netTaxableIncome, financialYear);
    const normalSlabTax = baseTax;

    // 5. Special-Rate Tax Isolation (Section 111A / 112 / 112A)
    const specialRateTax = Math.max(0, Number(income.specialRateTax) || 0);
    const taxBeforeRebate = normalSlabTax + specialRateTax;

    // 6. Dedicated Section 87A Calculation (Rebate & Marginal Relief applied strictly to normalSlabTax)
    const rebateResult = Section87A.calculateNewRegime87A({
      totalIncome: netTaxableIncome,
      normalSlabTax,
      isResident,
      financialYear
    });

    const rebate87A = rebateResult.rebate87A;
    const taxAfterRebate = Math.max(0, normalSlabTax - rebate87A) + specialRateTax;
    const marginalRelief87A = rebateResult.marginalRelief;
    const taxAfterRelief = Math.max(0, normalSlabTax - rebate87A - marginalRelief87A) + specialRateTax;

    // 7. Surcharge & Cess Calculation (Cess calculated after rebate and relief)
    const surchargeResult = SurchargeCalc.calculateSurchargeAndCess({
      taxableIncome: netTaxableIncome,
      baseTaxAfterRebate: taxAfterRelief,
      regime: 'NEW',
      computeBaseTaxAtThreshold: (threshold) => {
        return computeNewRegimeBaseTaxForIncome(threshold, financialYear).baseTax;
      }
    });

    const totalTax = surchargeResult.totalTax;
    const annualTakeHome = Math.max(0, grossTotalIncome - totalTax);
    const monthlyTakeHome = Math.round(annualTakeHome / 12);
    const effectiveTaxRate = grossTotalIncome > 0 ? Number(((totalTax / grossTotalIncome) * 100).toFixed(2)) : 0;

    return {
      regime: 'NEW',
      financialYear,
      employmentType,
      isResident,
      grossTotalIncome: Math.round(grossTotalIncome),
      gross_income: Math.round(grossTotalIncome),
      salaryIncome: Math.round(salaryIncome),
      otherSourcesIncome: Math.round(otherSourcesIncome),
      standardDeduction: newDeductions.standardDeduction,
      sec80CCD2: newDeductions.sec80CCD2,
      familyPensionDeduction: newDeductions.familyPensionDeduction,
      totalDeductions: Math.round(newDeductions.totalDeductions),
      total_deductions: Math.round(newDeductions.totalDeductions),
      netTaxableIncome: Math.round(netTaxableIncome),
      taxable_income: Math.round(netTaxableIncome),
      normalSlabTax: Math.round(normalSlabTax),
      normal_slab_tax: Math.round(normalSlabTax),
      specialRateTax: Math.round(specialRateTax),
      special_rate_tax: Math.round(specialRateTax),
      baseTax: Math.round(normalSlabTax),
      taxBeforeRebate: Math.round(taxBeforeRebate),
      tax_before_rebate: Math.round(taxBeforeRebate),
      rebate87A: Math.round(rebate87A),
      rebate_87a: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      tax_after_rebate: Math.round(taxAfterRebate),
      marginalRelief87A: Math.round(marginalRelief87A),
      marginal_relief: Math.round(marginalRelief87A),
      taxAfterRelief: Math.round(taxAfterRelief),
      tax_after_rebate_relief: Math.round(taxAfterRelief),
      surchargeRate: surchargeResult.surchargeRate,
      nominalSurcharge: surchargeResult.nominalSurcharge,
      surchargeMarginalRelief: surchargeResult.marginalRelief,
      surcharge: surchargeResult.finalSurcharge,
      cess: surchargeResult.cess,
      totalTax: Math.round(totalTax),
      final_tax: Math.round(totalTax),
      effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
      annualTakeHome: Math.round(annualTakeHome),
      monthlyTakeHome,
      slabBreakdown
    };
  }

  return {
    computeNewRegimeBaseTaxForIncome,
    calculateNewRegimeTax
  };
}));
