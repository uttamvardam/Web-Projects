/**
 * TaxClarity - Centralized Reactive State Store
 * Manages user input state, dispatches instant recalculation (< 10ms), and notifies registered UI subscribers
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const TaxEngine = require('../engine/taxEngine.js');
    module.exports = factory(TaxEngine);
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.Store = factory(root.TaxClarity.TaxEngine);
  }
}(typeof self !== 'undefined' ? self : this, function (TaxEngine) {
  'use strict';

  const defaultState = {
    profile: {
      financialYear: '2025-26',
      ageCategory: 'general',
      employmentType: 'salaried',
      isMetro: true
    },
    income: {
      salaryMode: 'quick',
      grossSalary: 0,
      basicSalary: 0,
      hraReceived: 0,
      specialAllowance: 0,
      otherAllowances: 0,
      rentalIncome: 0,
      municipalTaxes: 0,
      homeLoanInterest: 0,
      savingsInterest: 0,
      fdInterest: 0,
      dividendIncome: 0,
      capitalGains: 0,
      businessIncome: 0,
      familyPension: 0,
      otherIncome: 0
    },
    deductions: {
      sec80C: 0,
      epf: 0,
      ppf: 0,
      elss: 0,
      lifeInsurance: 0,
      homeLoanPrincipal: 0,
      tuitionFees: 0,
      taxSaverFD: 0,
      other80C: 0,
      sec80CCD1B: 0,
      sec80CCD2: 0,
      sec80DSelf: 0,
      sec80DParents: 0,
      isSelfSenior: false,
      isParentsSenior: false,
      preventiveHealthCheckup: 0,
      rentPaid: 0,
      customHRAExemption: 0,
      sec80E: 0,
      sec80G: 0,
      sec80TTA: 0,
      sec80TTB: 0,
      sec80EEA: 0
    },
    calculationResults: null
  };

  let state = JSON.parse(JSON.stringify(defaultState));
  const subscribers = new Set();

  function recalculate() {
    const engine = TaxEngine || (window.TaxClarity && window.TaxClarity.TaxEngine);
    if (!engine) return;

    state.calculationResults = engine.compareRegimes({
      income: state.income,
      deductions: state.deductions,
      profile: state.profile,
      financialYear: state.profile.financialYear
    });

    notifySubscribers();
  }

  function notifySubscribers() {
    subscribers.forEach(listener => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in store subscriber callback:', err);
      }
    });
  }

  function updateProfile(patch) {
    state.profile = { ...state.profile, ...patch };
    recalculate();
  }

  function updateIncome(patch) {
    state.income = { ...state.income, ...patch };
    
    // Auto sync gross salary if in detailed mode
    if (state.income.salaryMode === 'detailed') {
      const basic = Number(state.income.basicSalary) || 0;
      const hra = Number(state.income.hraReceived) || 0;
      const special = Number(state.income.specialAllowance) || 0;
      const other = Number(state.income.otherAllowances) || 0;
      state.income.grossSalary = basic + hra + special + other;
    }

    recalculate();
  }

  function updateDeductions(patch) {
    state.deductions = { ...state.deductions, ...patch };
    recalculate();
  }

  function resetState() {
    state = JSON.parse(JSON.stringify(defaultState));
    recalculate();
  }

  function loadScenarioState(savedState) {
    if (savedState && savedState.profile && savedState.income && savedState.deductions) {
      state = JSON.parse(JSON.stringify(savedState));
      recalculate();
    }
  }

  function subscribe(listener) {
    if (typeof listener === 'function') {
      subscribers.add(listener);
      // Immediately call with current state
      if (state.calculationResults) {
        listener(state);
      }
    }
    return () => subscribers.delete(listener);
  }

  function getState() {
    return state;
  }

  // Initial calculation
  recalculate();

  return {
    getState,
    updateProfile,
    updateIncome,
    updateDeductions,
    resetState,
    loadScenarioState,
    subscribe,
    recalculate
  };
}));
