/**
 * TaxClarity - Comprehensive Automated Unit Test Suite (AY 2026–27 / FY 2025–26)
 * Validates Section 87A Rebate, Marginal Relief, Special-Rate Income, Cess & All 9 Canonical Test Cases
 */

(function () {
  'use strict';

  const isNode = typeof module === 'object' && typeof module.exports === 'object';

  let Constants, Section87A, HRACalculator, DeductionsCalculator, SurchargeCalculator, OldRegimeCalculator, NewRegimeCalculator, TaxEngine;

  if (isNode) {
    Constants = require('../constants.js');
    Section87A = require('../engine/section87a.js');
    HRACalculator = require('../engine/hraCalculator.js');
    DeductionsCalculator = require('../engine/deductionsCalculator.js');
    SurchargeCalculator = require('../engine/surchargeCalculator.js');
    OldRegimeCalculator = require('../engine/oldRegimeCalculator.js');
    NewRegimeCalculator = require('../engine/newRegimeCalculator.js');
    TaxEngine = require('../engine/taxEngine.js');
  } else {
    Constants = window.TaxClarity.Constants;
    Section87A = window.TaxClarity.Section87A;
    HRACalculator = window.TaxClarity.HRACalculator;
    DeductionsCalculator = window.TaxClarity.DeductionsCalculator;
    SurchargeCalculator = window.TaxClarity.SurchargeCalculator;
    OldRegimeCalculator = window.TaxClarity.OldRegimeCalculator;
    NewRegimeCalculator = window.TaxClarity.NewRegimeCalculator;
    TaxEngine = window.TaxClarity.TaxEngine;
  }

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function assert(condition, testName, details = '') {
    if (condition) {
      results.passed++;
      results.tests.push({ name: testName, status: 'PASS', details });
      console.log(`\x1b[32m✔ PASS\x1b[0m: ${testName}`);
    } else {
      results.failed++;
      results.tests.push({ name: testName, status: 'FAIL', details });
      console.error(`\x1b[31m✖ FAIL\x1b[0m: ${testName} - ${details}`);
    }
  }

  function assertEqual(actual, expected, testName) {
    let isMatch = false;
    if (typeof actual === 'number' && typeof expected === 'number') {
      isMatch = Math.abs(actual - expected) <= 1; // 1 rupee rounding tolerance
    } else {
      isMatch = (actual === expected);
    }
    assert(isMatch, testName, `Expected: ${expected}, Got: ${actual}`);
  }

  console.log('\n================================================================');
  console.log('   TAXCLARITY - SECTION 87A & MARGINAL RELIEF TEST SUITE        ');
  console.log('   Assessment Year: AY 2026–27 | Financial Year: FY 2025–26     ');
  console.log('================================================================\n');

  // ==========================================
  // OLD TAX REGIME TEST CASES
  // ==========================================

  // --- Test Case 1: Old Regime, Taxable Income = ₹4,00,000 ---
  (function testCase1() {
    // Non-salaried (0 standard deduction) to test net taxable income = 4,00,000 exactly
    const res = OldRegimeCalculator.calculateOldRegimeTax(
      { businessIncome: 400000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 400000, 'Test Case 1: Taxable Income is ₹4,00,000');
    assertEqual(res.tax_before_rebate, 7500, 'Test Case 1: Tax Before Rebate is ₹7,500 (5% on 1.5L)');
    assertEqual(res.rebate_87a, 7500, 'Test Case 1: 87A Rebate is ₹7,500');
    assertEqual(res.tax_after_rebate, 0, 'Test Case 1: Tax After Rebate is ₹0');
    assertEqual(res.final_tax, 0, 'Test Case 1: Final Tax Payable is ₹0');
  })();

  // --- Test Case 2: Old Regime, Taxable Income = ₹5,00,000 ---
  (function testCase2() {
    const res = OldRegimeCalculator.calculateOldRegimeTax(
      { businessIncome: 500000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 500000, 'Test Case 2: Taxable Income is ₹5,00,000');
    assertEqual(res.tax_before_rebate, 12500, 'Test Case 2: Tax Before Rebate is ₹12,500 (5% on 2.5L)');
    assertEqual(res.rebate_87a, 12500, 'Test Case 2: 87A Rebate is ₹12,500');
    assertEqual(res.tax_after_rebate, 0, 'Test Case 2: Tax After Rebate is ₹0');
    assertEqual(res.final_tax, 0, 'Test Case 2: Final Tax Payable is ₹0');
  })();

  // --- Test Case 3: Old Regime, Taxable Income = ₹5,10,000 ---
  (function testCase3() {
    const res = OldRegimeCalculator.calculateOldRegimeTax(
      { businessIncome: 510000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 510000, 'Test Case 3: Taxable Income is ₹5,10,000');
    assertEqual(res.tax_before_rebate, 14500, 'Test Case 3: Tax Before Rebate is ₹14,500 (12.5k + 20% on 10k)');
    assertEqual(res.rebate_87a, 0, 'Test Case 3: 87A Rebate is ₹0 (income > ₹5L threshold)');
    assertEqual(res.tax_after_rebate, 14500, 'Test Case 3: Tax After Rebate is ₹14,500');
    assertEqual(res.cess, 580, 'Test Case 3: Health & Education Cess is ₹580 (4%)');
    assertEqual(res.final_tax, 15080, 'Test Case 3: Final Tax Payable is ₹15,080');
  })();

  // ==========================================
  // NEW TAX REGIME TEST CASES (AY 2026–27)
  // ==========================================

  // --- Test Case 4: New Regime, Taxable Income = ₹11,75,000 ---
  (function testCase4() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 1175000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 1175000, 'Test Case 4: Taxable Income is ₹11,75,000');
    assertEqual(res.tax_before_rebate, 57500, 'Test Case 4: Tax Before Rebate is ₹57,500 (20k + 37.5k)');
    assertEqual(res.rebate_87a, 57500, 'Test Case 4: 87A Rebate is ₹57,500 (MIN(57500, 60000))');
    assertEqual(res.tax_after_rebate, 0, 'Test Case 4: Tax After Rebate is ₹0');
    assertEqual(res.final_tax, 0, 'Test Case 4: Final Tax Payable is ₹0');
  })();

  // --- Test Case 5: New Regime, Taxable Income = ₹12,00,000 ---
  (function testCase5() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 1200000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 1200000, 'Test Case 5: Taxable Income is ₹12,00,000');
    assertEqual(res.tax_before_rebate, 60000, 'Test Case 5: Tax Before Rebate is ₹60,000 (20k + 40k)');
    assertEqual(res.rebate_87a, 60000, 'Test Case 5: 87A Rebate is ₹60,000');
    assertEqual(res.tax_after_rebate, 0, 'Test Case 5: Tax After Rebate is ₹0');
    assertEqual(res.final_tax, 0, 'Test Case 5: Final Tax Payable is ₹0');
  })();

  // --- Test Case 6: New Regime, Taxable Income = ₹12,01,000 ---
  (function testCase6() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 1201000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 1201000, 'Test Case 6: Taxable Income is ₹12,01,000');
    assertEqual(res.tax_before_rebate, 60150, 'Test Case 6: Tax Before Relief is ₹60,150 (60k + 15% on 1k)');
    assertEqual(res.rebate_87a, 0, 'Test Case 6: 87A Rebate is ₹0 (income > ₹12L)');
    assertEqual(res.marginal_relief, 59150, 'Test Case 6: Marginal Relief is ₹59,150 (60,150 - 1,000 excess)');
    assertEqual(res.tax_after_rebate_relief, 1000, 'Test Case 6: Tax After Relief is ₹1,000');
    assertEqual(res.cess, 40, 'Test Case 6: Cess is ₹40 (4% of ₹1,000)');
    assertEqual(res.final_tax, 1040, 'Test Case 6: Final Tax Payable is ₹1,040');
  })();

  // --- Test Case 7: New Regime, Taxable Income = ₹12,10,000 ---
  (function testCase7() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 1210000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 1210000, 'Test Case 7: Taxable Income is ₹12,10,000');
    assertEqual(res.tax_before_rebate, 61500, 'Test Case 7: Tax Before Relief is ₹61,500 (60k + 15% on 10k)');
    assertEqual(res.rebate_87a, 0, 'Test Case 7: 87A Rebate is ₹0');
    assertEqual(res.marginal_relief, 51500, 'Test Case 7: Marginal Relief is ₹51,500 (61,500 - 10,000 excess)');
    assertEqual(res.tax_after_rebate_relief, 10000, 'Test Case 7: Tax After Relief is ₹10,000');
    assertEqual(res.cess, 400, 'Test Case 7: Cess is ₹400 (4% of ₹10,000)');
    assertEqual(res.final_tax, 10400, 'Test Case 7: Final Tax Payable is ₹10,400');
  })();

  // --- Test Case 8: New Regime, Taxable Income = ₹12,50,000 ---
  (function testCase8() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 1250000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 1250000, 'Test Case 8: Taxable Income is ₹12,50,000');
    assertEqual(res.tax_before_rebate, 67500, 'Test Case 8: Tax Before Relief is ₹67,500 (60k + 15% on 50k)');
    assertEqual(res.rebate_87a, 0, 'Test Case 8: 87A Rebate is ₹0');
    assertEqual(res.marginal_relief, 17500, 'Test Case 8: Marginal Relief is ₹17,500 (67,500 - 50,000 excess)');
    assertEqual(res.tax_after_rebate_relief, 50000, 'Test Case 8: Tax After Relief is ₹50,000');
    assertEqual(res.cess, 2000, 'Test Case 8: Cess is ₹2,000 (4% of ₹50,000)');
    assertEqual(res.final_tax, 52000, 'Test Case 8: Final Tax Payable is ₹52,000');
  })();

  // --- Test Case 9: New Regime, Taxable Income = ₹12,70,588 ---
  (function testCase9() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 1270588 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.taxable_income, 1270588, 'Test Case 9: Taxable Income is ₹12,70,588');
    assertEqual(res.tax_before_rebate, 70588, 'Test Case 9: Tax Before Relief is ₹70,588');
    assertEqual(res.marginal_relief, 0, 'Test Case 9: Marginal Relief is ₹0 (reached transition endpoint)');
    assertEqual(res.tax_after_rebate_relief, 70588, 'Test Case 9: Tax After Relief is ₹70,588');
    assertEqual(res.cess, 2824, 'Test Case 9: Cess is ₹2,824 (4% of ₹70,588)');
    assertEqual(res.final_tax, 73412, 'Test Case 9: Final Tax Payable is ₹73,412');
  })();

  // ==========================================
  // ADDITIONAL VALIDATION: SPECIAL-RATE INCOME & RESIDENCY
  // ==========================================

  // --- Special-Rate Income Isolation Test ---
  (function testSpecialRate() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 400000, specialRateTax: 5000 },
      {},
      { employmentType: 'self_employed', isResident: true },
      '2025-26'
    );
    assertEqual(res.normal_slab_tax, 0, 'Special Rate Test: Normal Slab Tax is ₹0');
    assertEqual(res.special_rate_tax, 5000, 'Special Rate Test: Special Rate Tax is ₹5,000');
    assertEqual(res.tax_before_rebate, 5000, 'Special Rate Test: Tax Before Rebate is ₹5,000');
    assertEqual(res.rebate_87a, 0, 'Special Rate Test: 87A does not offset special-rate tax');
    assertEqual(res.tax_after_rebate_relief, 5000, 'Special Rate Test: Tax After Relief preserves ₹5,000');
    assertEqual(res.cess, 200, 'Special Rate Test: Cess is ₹200 (4% of ₹5,000)');
    assertEqual(res.final_tax, 5200, 'Special Rate Test: Final Tax Payable is ₹5,200');
  })();

  // --- Non-Resident Eligibility Test ---
  (function testNonResident() {
    const res = NewRegimeCalculator.calculateNewRegimeTax(
      { businessIncome: 500000 },
      {},
      { employmentType: 'self_employed', isResident: false },
      '2025-26'
    );
    assertEqual(res.rebate_87a, 0, 'Non-Resident Test: 87A is ₹0 for non-resident');
    assertEqual(res.tax_after_rebate_relief, 5000, 'Non-Resident Test: Normal tax of ₹5,000 is payable');
    assertEqual(res.cess, 200, 'Non-Resident Test: Cess is ₹200');
    assertEqual(res.final_tax, 5200, 'Non-Resident Test: Final Tax is ₹5,200');
  })();

  // ==========================================
  // RESET ALL APPLICATION STATE TEST
  // ==========================================
  (function testResetAllState() {
    if (isNode) {
      const Store = require('../state/store.js');
      Store.updateProfile({ ageCategory: 'senior', financialYear: '2024-25' });
      Store.updateIncome({ grossSalary: 3500000, rentalIncome: 500000 });
      Store.updateDeductions({ sec80C: 50000, sec80DSelf: 10000 });

      assertEqual(Store.getState().income.grossSalary, 3500000, 'Reset Test: Modified gross salary is 35L');
      
      // Trigger reset
      Store.resetState();

      const resetState = Store.getState();
      assertEqual(resetState.profile.financialYear, '2025-26', 'Reset Test: Restored FY to 2025-26');
      assertEqual(resetState.profile.ageCategory, 'general', 'Reset Test: Restored age category to general');
      assertEqual(resetState.income.grossSalary, 0, 'Reset Test: Restored gross salary to 0');
      assertEqual(resetState.income.rentalIncome, 0, 'Reset Test: Cleared rental income to 0');
      assertEqual(resetState.deductions.sec80C, 0, 'Reset Test: Restored default 80C to 0');
      assertEqual(resetState.calculationResults !== null, true, 'Reset Test: Recalculation performed automatically on reset');
    }
  })();

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL TESTS: ${results.passed + results.failed}`);
  console.log(`PASSED: ${results.passed}`);
  if (results.failed > 0) {
    console.log(`FAILED: ${results.failed}`);
  } else {
    console.log('\x1b[32mALL 9 CANONICAL + EDGE-CASE TEST SUITES PASSED (100%)!\x1b[0m');
  }
  console.log('----------------------------------------------------------------\n');

  if (isNode && results.failed > 0) {
    process.exit(1);
  }
})();
