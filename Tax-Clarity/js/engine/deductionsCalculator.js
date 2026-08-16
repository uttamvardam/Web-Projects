/**
 * TaxClarity - Deductions & Exemptions Engine
 * Computes statutory deductions under Chapter VI-A, Section 24(b), and Section 57
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Constants = require('../constants.js');
    module.exports = factory(Constants);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.DeductionsCalculator = factory(root.TaxClarity.Constants);
  }
}(typeof self !== 'undefined' ? self : this, function (Constants) {
  'use strict';

  const { DEDUCTION_LIMITS, AGE_CATEGORIES, EMPLOYMENT_TYPES } = Constants;

  /**
   * Calculate all deductions and return separate breakdowns for Old and New regimes
   * 
   * @param {Object} deductions - Raw deduction inputs from user
   * @param {Object} profile - User profile (ageCategory, employmentType, etc.)
   * @param {Object} income - Income details (basic salary, family pension, etc.)
   * @param {string} [financialYear='2024-25'] - Selected financial year
   * @returns {Object} Comprehensive deduction summaries for Old and New regimes
   */
  function calculateDeductions(deductions = {}, profile = {}, income = {}, financialYear = '2024-25') {
    const ageCategory = profile.ageCategory || AGE_CATEGORIES.GENERAL;
    const employmentType = profile.employmentType || EMPLOYMENT_TYPES.SALARIED;
    const isSalariedOrPensioner = (employmentType === EMPLOYMENT_TYPES.SALARIED || employmentType === EMPLOYMENT_TYPES.PENSIONER);

    // 1. Standard Deduction (Section 16(ia) / Section 115BAC)
    const fyConfig = Constants.FINANCIAL_YEARS[financialYear] || Constants.FINANCIAL_YEARS[Constants.DEFAULT_FY];
    const grossSalary = Math.max(0, Number(income.grossSalary) || 0);
    const basicSalary = Math.max(0, Number(income.basicSalary) || 0);
    const hraReceived = Math.max(0, Number(income.hraReceived) || 0);
    const specialAllowance = Math.max(0, Number(income.specialAllowance) || 0);
    const otherAllowances = Math.max(0, Number(income.otherAllowances) || Number(income.bonus) || 0);
    const familyPension = Math.max(0, Number(income.familyPension) || 0);

    const salaryIncome = (income.salaryMode === 'detailed')
      ? (basicSalary + hraReceived + specialAllowance + otherAllowances)
      : grossSalary;

    let stdDedOld = 0;
    let stdDedNew = 0;

    if (isSalariedOrPensioner) {
      const maxOld = fyConfig.oldRegimeStdDed;
      const maxNew = fyConfig.newRegimeStdDed;
      const eligibleSalary = (salaryIncome > 0) ? salaryIncome : (familyPension > 0 ? familyPension : ((income.grossSalary === undefined && !income.businessIncome && !income.rentalIncome) ? Infinity : 0));

      if (eligibleSalary === Infinity || (salaryIncome === 0 && familyPension === 0 && !income.businessIncome && !income.rentalIncome && !income.capitalGains)) {
        stdDedOld = maxOld;
        stdDedNew = maxNew;
      } else {
        stdDedOld = Math.min(maxOld, eligibleSalary);
        stdDedNew = Math.min(maxNew, eligibleSalary);
      }
    }

    // 2. Section 80C
    const raw80C = Math.max(0, Number(deductions.sec80C) || 0) +
      Math.max(0, Number(deductions.epf) || 0) +
      Math.max(0, Number(deductions.ppf) || 0) +
      Math.max(0, Number(deductions.elss) || 0) +
      Math.max(0, Number(deductions.lifeInsurance) || 0) +
      Math.max(0, Number(deductions.homeLoanPrincipal) || 0) +
      Math.max(0, Number(deductions.tuitionFees) || 0) +
      Math.max(0, Number(deductions.taxSaverFD) || 0) +
      Math.max(0, Number(deductions.other80C) || 0);

    const eligible80C = Math.min(raw80C, DEDUCTION_LIMITS.SEC_80C_MAX);

    // 3. Section 80CCD(1B) - Additional NPS (Employee)
    const raw80CCD1B = Math.max(0, Number(deductions.sec80CCD1B) || 0);
    const eligible80CCD1B = Math.min(raw80CCD1B, DEDUCTION_LIMITS.SEC_80CCD1B_MAX);

    // 4. Section 80CCD(2) - Employer NPS Contribution (Allowed in BOTH Old and New Regimes)
    const dearnessAllowance = Math.max(0, Number(income.dearnessAllowance) || 0);
    const salaryForNps = basicSalary + dearnessAllowance;
    const raw80CCD2 = Math.max(0, Number(deductions.sec80CCD2) || 0);
    const maxEmployerNps = salaryForNps > 0 ? (0.14 * salaryForNps) : Infinity;
    const eligible80CCD2 = salaryForNps > 0 ? Math.min(raw80CCD2, maxEmployerNps) : raw80CCD2;

    // 5. Section 80D - Health Insurance & Checkups
    const isSelfSenior = (ageCategory === AGE_CATEGORIES.SENIOR || ageCategory === AGE_CATEGORIES.SUPER_SENIOR || Boolean(deductions.isSelfSenior));
    const isParentsSenior = Boolean(deductions.isParentsSenior);

    const raw80DSelf = Math.max(0, Number(deductions.sec80DSelf) || 0);
    const raw80DParents = Math.max(0, Number(deductions.sec80DParents) || 0);
    const rawPreventive = Math.max(0, Number(deductions.preventiveHealthCheckup) || 0);

    // Preventive checkup is capped at ₹5,000 and absorbed within the overall limits
    const allowedPreventive = Math.min(rawPreventive, DEDUCTION_LIMITS.SEC_80D_PREVENTIVE_HEALTH_MAX);

    const limitSelf = isSelfSenior ? DEDUCTION_LIMITS.SEC_80D_SELF_SENIOR : DEDUCTION_LIMITS.SEC_80D_SELF_GENERAL;
    const limitParents = isParentsSenior ? DEDUCTION_LIMITS.SEC_80D_PARENTS_SENIOR : DEDUCTION_LIMITS.SEC_80D_PARENTS_GENERAL;

    const eligible80DSelf = Math.min(raw80DSelf + allowedPreventive, limitSelf);
    const eligible80DParents = Math.min(raw80DParents, limitParents);
    const eligible80D = Math.min(eligible80DSelf + eligible80DParents, DEDUCTION_LIMITS.SEC_80D_OVERALL_MAX);

    // 6. Section 24(b) - Home Loan Interest on Self-Occupied House Property (Loss from House Property)
    const homeLoanInterest = Math.max(0, Number(deductions.homeLoanInterest) || Number(deductions.sec24b) || Number(income.homeLoanInterest) || 0);
    const eligibleSec24b = Math.min(homeLoanInterest, DEDUCTION_LIMITS.SEC_24B_SELF_OCCUPIED_MAX);

    // 7. Section 80TTA / 80TTB - Interest Deductions
    const savingsInterest = Math.max(0, Number(income.savingsInterest) || Number(deductions.savingsInterest) || 0);
    const fdInterest = Math.max(0, Number(income.fdInterest) || Number(deductions.fdInterest) || 0);

    let eligible80TTA = 0;
    let eligible80TTB = 0;

    if (ageCategory === AGE_CATEGORIES.SENIOR || ageCategory === AGE_CATEGORIES.SUPER_SENIOR) {
      // Senior citizens get 80TTB up to ₹50,000 on both savings and FD interest
      eligible80TTB = Math.min(savingsInterest + fdInterest, DEDUCTION_LIMITS.SEC_80TTB_MAX);
    } else {
      // General taxpayers get 80TTA up to ₹10,000 on savings bank interest only
      eligible80TTA = Math.min(savingsInterest, DEDUCTION_LIMITS.SEC_80TTA_MAX);
    }

    // 8. Section 80E - Higher Education Loan Interest (No Cap)
    const eligible80E = Math.max(0, Number(deductions.sec80E) || 0);

    // 9. Section 80G - Donations to Charitable Institutions
    const eligible80G = Math.max(0, Number(deductions.sec80G) || 0);

    // 10. Other Chapter VI-A Deductions (80GG, 80U, 80DD, etc.)
    const otherDeductions = Math.max(0, Number(deductions.otherDeductions) || 0);

    // 11. Family Pension Deduction (Section 57(iia))
    const familyPensionDedNew = familyPension > 0 ? Math.min(25000, Math.round(familyPension / 3)) : 0;
    const familyPensionDedOld = familyPension > 0 ? Math.min(15000, Math.round(familyPension / 3)) : 0;

    // Aggregates for Old Regime
    const totalChapterVIAOld = eligible80C + eligible80CCD1B + eligible80CCD2 + eligible80D + eligible80TTA + eligible80TTB + eligible80E + eligible80G + otherDeductions;
    const totalDeductionsOld = stdDedOld + totalChapterVIAOld + eligibleSec24b + familyPensionDedOld;

    // Aggregates for New Regime (Only Standard Deduction + 80CCD(2) + Family Pension allowed)
    const totalDeductionsNew = stdDedNew + eligible80CCD2 + familyPensionDedNew;

    return {
      oldRegime: {
        standardDeduction: stdDedOld,
        sec80C: eligible80C,
        sec80CCD1B: eligible80CCD1B,
        sec80CCD2: eligible80CCD2,
        sec80D: eligible80D,
        sec80DSelf: eligible80DSelf,
        sec80DParents: eligible80DParents,
        sec24b: eligibleSec24b,
        sec80TTA: eligible80TTA,
        sec80TTB: eligible80TTB,
        sec80E: eligible80E,
        sec80G: eligible80G,
        familyPensionDeduction: familyPensionDedOld,
        otherDeductions,
        totalChapterVIA: totalChapterVIAOld,
        totalDeductions: totalDeductionsOld
      },
      newRegime: {
        standardDeduction: stdDedNew,
        sec80CCD2: eligible80CCD2,
        familyPensionDeduction: familyPensionDedNew,
        totalDeductions: totalDeductionsNew
      }
    };
  }

  return {
    calculateDeductions
  };
}));
