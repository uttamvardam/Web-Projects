/**
 * TaxClarity - Old Tax Regime Calculation Engine
 * Implements Slabs by Age Category, Standard Deduction, Section 87A Rebate, Surcharge & Cess
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Constants = require('../constants.js');
    const DeductionsCalc = require('./deductionsCalculator.js');
    const HRACalc = require('./hraCalculator.js');
    const SurchargeCalc = require('./surchargeCalculator.js');
    const Section87A = require('./section87a.js');
    module.exports = factory(Constants, DeductionsCalc, HRACalc, SurchargeCalc, Section87A);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.OldRegimeCalculator = factory(
      root.TaxClarity.Constants,
      root.TaxClarity.DeductionsCalculator,
      root.TaxClarity.HRACalculator,
      root.TaxClarity.SurchargeCalculator,
      root.TaxClarity.Section87A
    );
  }
}(typeof self !== 'undefined' ? self : this, function (Constants, DeductionsCalc, HRACalc, SurchargeCalc, Section87A) {
  'use strict';

  const { OLD_REGIME_SLABS, AGE_CATEGORIES, EMPLOYMENT_TYPES } = Constants;

  /**
   * Helper to compute base tax for any income amount under Old Regime slabs for a given age category
   */
  function computeOldRegimeBaseTaxForIncome(taxableIncome, ageCategory = AGE_CATEGORIES.GENERAL) {
    const slabs = OLD_REGIME_SLABS[ageCategory] || OLD_REGIME_SLABS[AGE_CATEGORIES.GENERAL];
    const income = Math.max(0, Number(taxableIncome) || 0);
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
   * Calculate complete tax liability under Old Tax Regime
   * 
   * @param {Object} income - Income details
   * @param {Object} deductions - Deduction inputs
   * @param {Object} profile - User profile (ageCategory, employmentType, isMetro, isResident)
   * @param {string} [financialYear='2025-26'] - Selected Financial Year
   * @returns {Object} Comprehensive calculation results
   */
  function calculateOldRegimeTax(income = {}, deductions = {}, profile = {}, financialYear = '2025-26') {
    const ageCategory = profile.ageCategory || AGE_CATEGORIES.GENERAL;
    const employmentType = profile.employmentType || EMPLOYMENT_TYPES.SALARIED;
    const isResident = (profile.isResident !== false && profile.residencyStatus !== 'non_resident');

    // 1. Gross Income Component Calculation
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

    // 2. HRA Exemption Calculation
    let hraExemption = 0;
    let hraBreakdown = null;
    if (deductions.rentPaid && hraReceived > 0 && basicSalary > 0) {
      const hraRes = HRACalc.calculateHRAExemption({
        basicSalary,
        dearnessAllowance: Number(income.dearnessAllowance) || 0,
        hraReceived,
        rentPaid: Number(deductions.rentPaid) || 0,
        isMetro: Boolean(profile.isMetro)
      });
      hraExemption = hraRes.exemptHRA;
      hraBreakdown = hraRes.breakdown;
    } else if (deductions.customHRAExemption) {
      hraExemption = Math.min(hraReceived, Math.max(0, Number(deductions.customHRAExemption) || 0));
    }

    // 3. Deductions & Section 24b
    const deductionResults = DeductionsCalc.calculateDeductions(deductions, profile, income, financialYear);
    const oldDeductions = deductionResults.oldRegime;
    const totalEligibleDeductions = oldDeductions.totalDeductions + hraExemption;

    // 4. Net Taxable Income (Taxable / Total Income after eligible deductions)
    const netTaxableIncome = Math.max(0, grossTotalIncome - totalEligibleDeductions);

    // 5. Slab Computation (Normal Slab Tax)
    const { baseTax, slabBreakdown } = computeOldRegimeBaseTaxForIncome(netTaxableIncome, ageCategory);
    const normalSlabTax = baseTax;

    // 6. Special-Rate Tax Isolation (Section 111A / 112 / 112A)
    const specialRateTax = Math.max(0, Number(income.specialRateTax) || 0);
    const taxBeforeRebate = normalSlabTax + specialRateTax;

    // 7. Dedicated Section 87A Rebate Calculation (Applied strictly to normalSlabTax)
    const rebateResult = Section87A.calculateOldRegime87A({
      totalIncome: netTaxableIncome,
      normalSlabTax,
      isResident
    });

    const rebate87A = rebateResult.rebate87A;
    const taxAfterRebate = Math.max(0, normalSlabTax - rebate87A) + specialRateTax;
    const marginalRelief87A = rebateResult.marginalRelief || 0;
    const taxAfterRelief = Math.max(0, normalSlabTax - rebate87A - marginalRelief87A) + specialRateTax;

    // 8. Surcharge & Cess Calculation (Cess calculated after 87A and marginal relief)
    const surchargeResult = SurchargeCalc.calculateSurchargeAndCess({
      taxableIncome: netTaxableIncome,
      baseTaxAfterRebate: taxAfterRelief,
      regime: 'OLD',
      computeBaseTaxAtThreshold: (threshold) => {
        return computeOldRegimeBaseTaxForIncome(threshold, ageCategory).baseTax;
      }
    });

    const totalTax = surchargeResult.totalTax;
    const annualTakeHome = Math.max(0, grossTotalIncome - totalTax);
    const monthlyTakeHome = Math.round(annualTakeHome / 12);
    const effectiveTaxRate = grossTotalIncome > 0 ? Number(((totalTax / grossTotalIncome) * 100).toFixed(2)) : 0;

    return {
      regime: 'OLD',
      financialYear,
      ageCategory,
      employmentType,
      isResident,
      grossTotalIncome: Math.round(grossTotalIncome),
      gross_income: Math.round(grossTotalIncome),
      salaryIncome: Math.round(salaryIncome),
      otherSourcesIncome: Math.round(otherSourcesIncome),
      standardDeduction: oldDeductions.standardDeduction,
      hraExemption: Math.round(hraExemption),
      hraBreakdown,
      sec80C: oldDeductions.sec80C,
      sec80CCD1B: oldDeductions.sec80CCD1B,
      sec80CCD2: oldDeductions.sec80CCD2,
      sec80D: oldDeductions.sec80D,
      sec24b: oldDeductions.sec24b,
      sec80TTA: oldDeductions.sec80TTA,
      sec80TTB: oldDeductions.sec80TTB,
      sec80E: oldDeductions.sec80E,
      sec80G: oldDeductions.sec80G,
      otherChapterVIA: oldDeductions.otherDeductions,
      totalDeductions: Math.round(totalEligibleDeductions),
      total_deductions: Math.round(totalEligibleDeductions),
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
    computeOldRegimeBaseTaxForIncome,
    calculateOldRegimeTax
  };
}));
