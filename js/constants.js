/**
 * TaxClarity - Tax Constants & Configuration
 * Official Slabs & Limits for AY 2026-27 (FY 2025-26) & AY 2025-26 (FY 2024-25)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.Constants = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const FINANCIAL_YEARS = {
    '2024-25': {
      id: '2024-25',
      assessmentYear: '2025-26',
      label: 'FY 2024–25 (AY 2025–26)',
      newRegimeStdDed: 75000,
      oldRegimeStdDed: 50000,
      newRegime87ALimit: 700000,
      newRegime87AMaxRebate: 25000,
      oldRegime87ALimit: 500000,
      oldRegime87AMaxRebate: 12500
    },
    '2025-26': {
      id: '2025-26',
      assessmentYear: '2026-27',
      label: 'FY 2025–26 (AY 2026–27)',
      newRegimeStdDed: 75000,
      oldRegimeStdDed: 50000,
      newRegime87ALimit: 1200000,
      newRegime87AMaxRebate: 60000,
      oldRegime87ALimit: 500000,
      oldRegime87AMaxRebate: 12500
    }
  };

  const DEFAULT_FY = '2025-26';

  const AGE_CATEGORIES = {
    GENERAL: 'general',       // < 60 years
    SENIOR: 'senior',         // 60 to 79 years
    SUPER_SENIOR: 'super_senior' // 80 years and above
  };

  const EMPLOYMENT_TYPES = {
    SALARIED: 'salaried',
    PENSIONER: 'pensioner',
    SELF_EMPLOYED: 'self_employed',
    FREELANCER: 'freelancer'
  };

  // Official AY 2026-27 (FY 2025-26) New Regime Slabs: ₹4L / ₹8L / ₹12L / ₹16L / ₹20L / ₹24L
  const NEW_REGIME_SLABS_2025_26 = [
    { min: 0, max: 400000, rate: 0.00, label: 'Up to ₹4,00,000' },
    { min: 400000, max: 800000, rate: 0.05, label: '₹4,00,001 – ₹8,00,000' },
    { min: 800000, max: 1200000, rate: 0.10, label: '₹8,00,001 – ₹12,00,000' },
    { min: 1200000, max: 1600000, rate: 0.15, label: '₹12,00,001 – ₹16,00,000' },
    { min: 1600000, max: 2000000, rate: 0.20, label: '₹16,00,001 – ₹20,00,000' },
    { min: 2000000, max: 2400000, rate: 0.25, label: '₹20,00,001 – ₹24,00,000' },
    { min: 2400000, max: Infinity, rate: 0.30, label: 'Above ₹24,00,000' }
  ];

  // AY 2025-26 (FY 2024-25) New Regime Slabs: ₹3L / ₹7L / ₹10L / ₹12L / ₹15L
  const NEW_REGIME_SLABS_2024_25 = [
    { min: 0, max: 300000, rate: 0.00, label: 'Up to ₹3,00,000' },
    { min: 300000, max: 700000, rate: 0.05, label: '₹3,00,001 – ₹7,00,000' },
    { min: 700000, max: 1000000, rate: 0.10, label: '₹7,00,001 – ₹10,00,000' },
    { min: 1000000, max: 1200000, rate: 0.15, label: '₹10,00,001 – ₹12,00,000' },
    { min: 1200000, max: 1500000, rate: 0.20, label: '₹12,00,001 – ₹15,00,000' },
    { min: 1500000, max: Infinity, rate: 0.30, label: 'Above ₹15,00,000' }
  ];

  // Default New Regime Slabs (AY 2026-27 / FY 2025-26)
  const NEW_REGIME_SLABS = NEW_REGIME_SLABS_2025_26;

  function getNewRegimeSlabs(financialYear = '2025-26') {
    return (financialYear === '2024-25') ? NEW_REGIME_SLABS_2024_25 : NEW_REGIME_SLABS_2025_26;
  }

  // Old Tax Regime Slabs by Age Category
  const OLD_REGIME_SLABS = {
    [AGE_CATEGORIES.GENERAL]: [
      { min: 0, max: 250000, rate: 0.00, label: 'Up to ₹2,50,000' },
      { min: 250000, max: 500000, rate: 0.05, label: '₹2,50,001 – ₹5,00,000' },
      { min: 500000, max: 1000000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
      { min: 1000000, max: Infinity, rate: 0.30, label: 'Above ₹10,00,000' }
    ],
    [AGE_CATEGORIES.SENIOR]: [
      { min: 0, max: 300000, rate: 0.00, label: 'Up to ₹3,00,000' },
      { min: 300000, max: 500000, rate: 0.05, label: '₹3,00,001 – ₹5,00,000' },
      { min: 500000, max: 1000000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
      { min: 1000000, max: Infinity, rate: 0.30, label: 'Above ₹10,00,000' }
    ],
    [AGE_CATEGORIES.SUPER_SENIOR]: [
      { min: 0, max: 500000, rate: 0.00, label: 'Up to ₹5,00,000' },
      { min: 500000, max: 1000000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
      { min: 1000000, max: Infinity, rate: 0.30, label: 'Above ₹10,00,000' }
    ]
  };

  // Statutory Deduction Caps & Parameters
  const DEDUCTION_LIMITS = {
    SEC_80C_MAX: 150000,
    SEC_80CCD1B_MAX: 50000,
    SEC_80D_SELF_GENERAL: 25000,
    SEC_80D_SELF_SENIOR: 50000,
    SEC_80D_PARENTS_GENERAL: 25000,
    SEC_80D_PARENTS_SENIOR: 50000,
    SEC_80D_PREVENTIVE_HEALTH_MAX: 5000,
    SEC_80D_OVERALL_MAX: 100000,
    SEC_24B_SELF_OCCUPIED_MAX: 200000,
    SEC_80TTA_MAX: 10000,
    SEC_80TTB_MAX: 50000,
    FAMILY_PENSION_MAX: 25000,
    FAMILY_PENSION_RATE: 1 / 3,
    EMPLOYER_NPS_GOVT_MAX_RATE: 0.14,
    EMPLOYER_NPS_PVT_MAX_RATE: 0.14
  };

  // Surcharge Brackets
  const SURCHARGE_BRACKETS = [
    { min: 5000000, max: 10000000, oldRate: 0.10, newRate: 0.10, label: '₹50 Lakh to ₹1 Crore' },
    { min: 10000000, max: 20000000, oldRate: 0.15, newRate: 0.15, label: '₹1 Crore to ₹2 Crore' },
    { min: 20000000, max: 50000000, oldRate: 0.25, newRate: 0.25, label: '₹2 Crore to ₹5 Crore' },
    { min: 50000000, max: Infinity, oldRate: 0.37, newRate: 0.25, label: 'Above ₹5 Crore' }
  ];

  const CESS_RATE = 0.04; // 4% Health & Education Cess

  return Object.freeze({
    FINANCIAL_YEARS,
    DEFAULT_FY,
    AGE_CATEGORIES,
    EMPLOYMENT_TYPES,
    NEW_REGIME_SLABS,
    NEW_REGIME_SLABS_2025_26,
    NEW_REGIME_SLABS_2024_25,
    getNewRegimeSlabs,
    OLD_REGIME_SLABS,
    DEDUCTION_LIMITS,
    SURCHARGE_BRACKETS,
    CESS_RATE
  });
}));
