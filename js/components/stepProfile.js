/**
 * TaxClarity - Step 1: User Profile & Financial Year Component
 * Features custom 56px illustrated age-category avatars designed for fintech dashboards
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.StepProfile = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * 1. Below 60 Years: Working-Age Adult Illustration
   */
  function getAdultAgeIcon() {
    return `
      <svg class="age-illustration-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Modern Hair -->
        <path d="M15 18C15 11.5 19 8 24 8C29 8 33 11.5 33 18C33 19 32.5 19.5 31.5 19C29.5 18 26.5 17.5 24 17.5C20.5 17.5 17.5 18.5 16 19.5C15.3 20 15 19.5 15 18Z" fill="currentColor" opacity="0.85" />
        <!-- Head Contour -->
        <path d="M17 19V24C17 27.866 20.134 31 24 31C27.866 31 31 27.866 31 24V19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Ears -->
        <path d="M17 22C15.8954 22 15 22.8954 15 24C15 25.1046 15.8954 26 17 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M31 22C32.1046 22 33 22.8954 33 24C33 25.1046 32.1046 26 31 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <!-- Eyes -->
        <circle cx="20.5" cy="22.5" r="1.3" fill="currentColor" />
        <circle cx="27.5" cy="22.5" r="1.3" fill="currentColor" />
        <!-- Smile -->
        <path d="M21.5 26.5C22.2 27.3 23 27.7 24 27.7C25 27.7 25.8 27.3 26.5 26.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <!-- Neck & Business Collar -->
        <path d="M21 31V34.5L24 36.5L27 34.5V31" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <!-- Shoulders & Blazer -->
        <path d="M11 43C11 37.5 15.5 34 21 34H27C32.5 34 37 37.5 37 43" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <path d="M20 34L24 41L28 34" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
    `;
  }

  /**
   * 2. 60 to 79 Years: Senior Citizen Illustration with Classic Round Spectacles & Cardigan
   */
  function getSeniorAgeIcon() {
    return `
      <svg class="age-illustration-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Side-Parted Distinguished Senior Hair -->
        <path d="M15.5 19C15 13 18.5 9 24 9C29.5 9 32.5 13 32.5 19C31 17.5 28 16.5 24 16.5C19.5 16.5 17 17.8 15.5 19Z" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <!-- Head Contour -->
        <path d="M17 19V24C17 27.866 20.134 31 24 31C27.866 31 31 27.866 31 24V19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Ears -->
        <path d="M17 22C15.8954 22 15 22.8954 15 24C15 25.1046 15.8954 26 17 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M31 22C32.1046 22 33 22.8954 33 24C33 25.1046 32.1046 26 31 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <!-- Classic Round Glasses Frame -->
        <circle cx="20" cy="22" r="3.2" stroke="currentColor" stroke-width="1.8" fill="none" />
        <circle cx="28" cy="22" r="3.2" stroke="currentColor" stroke-width="1.8" fill="none" />
        <path d="M23.2 22H24.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M16.8 21.5L15.5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M31.2 21.5L32.5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <!-- Eyes -->
        <circle cx="20" cy="22" r="1.1" fill="currentColor" />
        <circle cx="28" cy="22" r="1.1" fill="currentColor" />
        <!-- Subtle Smile -->
        <path d="M21.5 27.2C22.2 27.8 23 28.1 24 28.1C25 28.1 25.8 27.8 26.5 27.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <!-- Neck & High Collar -->
        <path d="M21 31V34.5L24 36.5L27 34.5V31" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <!-- Shoulders & Cardigan -->
        <path d="M11 43C11 37.5 15.5 34 21 34H27C32.5 34 37 37.5 37 43" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <path d="M21 34.5L24 40.5L27 34.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
    `;
  }

  /**
   * 3. 80+ Years: Super Senior Citizen Illustration with Silver Side-Tufts & Formal Coat
   */
  function getSuperSeniorAgeIcon() {
    return `
      <svg class="age-illustration-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Bald Crown Contour -->
        <path d="M18 16C18 12.686 20.686 10 24 10C27.314 10 30 12.686 30 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <!-- Silver Side Tufts -->
        <path d="M16 17C14.5 18.5 14.5 21 15.5 23C16.5 23.5 17.5 22.5 17.5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
        <path d="M32 17C33.5 18.5 33.5 21 32.5 23C31.5 23.5 30.5 22.5 30.5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
        <!-- Head Contour -->
        <path d="M17 19V24C17 27.866 20.134 31 24 31C27.866 31 31 27.866 31 24V19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Ears -->
        <path d="M17 22C15.8954 22 15 22.8954 15 24C15 25.1046 15.8954 26 17 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M31 22C32.1046 22 33 22.8954 33 24C33 25.1046 32.1046 26 31 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <!-- Arched Eyebrows & Spectacles -->
        <path d="M18.5 18.5C19.5 18 20.8 18 21.8 18.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M26.2 18.5C27.2 18 28.5 18 29.5 18.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="20" cy="22.5" r="3" stroke="currentColor" stroke-width="1.8" fill="none" />
        <circle cx="28" cy="22.5" r="3" stroke="currentColor" stroke-width="1.8" fill="none" />
        <path d="M23 22.5H25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <!-- Eyes -->
        <circle cx="20" cy="22.5" r="1.1" fill="currentColor" />
        <circle cx="28" cy="22.5" r="1.1" fill="currentColor" />
        <!-- Dignified Mustache & Smile -->
        <path d="M20.5 26.8C22 26.2 23.2 26.6 24 27.2C24.8 26.6 26 26.2 27.5 26.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Neck & Formal Collar -->
        <path d="M21 31V34.5L24 36.5L27 34.5V31" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <!-- Shoulders & Coat -->
        <path d="M11 43C11 37.5 15.5 34 21 34H27C32.5 34 37 37.5 37 43" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <path d="M21 34L24 43" stroke="currentColor" stroke-width="1.8" />
      </svg>
    `;
  }

  function initStepProfile(containerId = 'step1Content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const Store = window.TaxClarity.Store;
    const currentState = Store ? Store.getState().profile : {
      financialYear: '2025-26',
      ageCategory: 'general',
      employmentType: 'salaried',
      isMetro: true
    };

    container.innerHTML = `
      <!-- Step Card Header -->
      <div class="step-card-header">
        <div class="step-card-header-left">
          <div class="step-avatar-icon">👤</div>
          <div>
            <h2 class="step-card-title">Step 1: Profile & Financial Year</h2>
            <p class="step-card-desc">Provide your profile details to get accurate tax comparison.</p>
          </div>
        </div>
        <div style="font-size: 1.75rem; opacity: 0.85;" aria-hidden="true">📋</div>
      </div>

      <!-- Financial Year Selection -->
      <div class="form-group" style="margin-bottom: var(--space-5);">
        <label class="form-label">
          <span class="form-label-text">
            <span>📅</span>
            <span>Select Financial Year (Assessment Year)</span>
          </span>
        </label>
        <div class="fy-selector-grid">
          <div class="fy-card ${currentState.financialYear === '2024-25' ? 'active' : ''}" data-fy="2024-25">
            <div class="fy-card-title">FY 2024–25</div>
            <div class="fy-card-sub">(AY 2025–26)</div>
          </div>
          <div class="fy-card ${currentState.financialYear === '2025-26' ? 'active' : ''}" data-fy="2025-26">
            <div class="fy-card-title">FY 2025–26</div>
            <div class="fy-card-sub">(AY 2026–27)</div>
          </div>
        </div>
      </div>

      <!-- Age Category -->
      <div class="form-group" style="margin-bottom: var(--space-5);">
        <label class="form-label">
          <span class="form-label-text">
            <span>👤</span>
            <span>Age Category</span>
          </span>
          <span class="form-hint" title="Affects Old Regime basic exemption thresholds">Affects Old Regime basic exemption ℹ️</span>
        </label>
        <div class="radio-cards-grid">
          <!-- Below 60 Years: Working Adult Avatar -->
          <div class="radio-card ${currentState.ageCategory === 'general' ? 'active' : ''}" data-age="general">
            <div class="age-icon-wrapper">
              ${getAdultAgeIcon()}
            </div>
            <span class="radio-card-title">Below 60 Years</span>
            <span class="radio-card-sub">General Individual<br>(₹2.5L Exemption)</span>
          </div>

          <!-- 60 to 79 Years: Senior Citizen Avatar -->
          <div class="radio-card ${currentState.ageCategory === 'senior' ? 'active' : ''}" data-age="senior">
            <div class="age-icon-wrapper">
              ${getSeniorAgeIcon()}
            </div>
            <span class="radio-card-title">60 to 79 Years</span>
            <span class="radio-card-sub">Senior Citizen<br>(₹3.0L + 80TTB)</span>
          </div>

          <!-- 80+ Years: Super Senior Citizen Avatar -->
          <div class="radio-card ${currentState.ageCategory === 'super_senior' ? 'active' : ''}" data-age="super_senior">
            <div class="age-icon-wrapper">
              ${getSuperSeniorAgeIcon()}
            </div>
            <span class="radio-card-title">80+ Years</span>
            <span class="radio-card-sub">Super Senior Citizen<br>(₹5.0L Exemption)</span>
          </div>
        </div>
      </div>

      <!-- Employment Type -->
      <div class="form-group" style="margin-bottom: var(--space-5);">
        <label class="form-label">
          <span class="form-label-text">
            <span>💼</span>
            <span>Employment / Income Type</span>
          </span>
          <span class="form-hint">Standard deduction ₹75k (New) / ₹50k (Old)</span>
        </label>
        <div class="radio-cards-grid">
          <div class="radio-card ${currentState.employmentType === 'salaried' ? 'active' : ''}" data-emp="salaried">
            <span class="radio-card-icon">💼</span>
            <span class="radio-card-title">Salaried</span>
            <span class="radio-card-sub">Form 16 / ITR-1<br>(₹75k / ₹50k Std Ded)</span>
          </div>
          <div class="radio-card ${currentState.employmentType === 'pensioner' ? 'active' : ''}" data-emp="pensioner">
            <span class="radio-card-icon">📜</span>
            <span class="radio-card-title">Pensioner</span>
            <span class="radio-card-sub">Family / Superannuation<br>(Std Ded + Exemption)</span>
          </div>
          <div class="radio-card ${currentState.employmentType === 'self_employed' ? 'active' : ''}" data-emp="self_employed">
            <span class="radio-card-icon">🏢</span>
            <span class="radio-card-title">Self-Employed / Biz</span>
            <span class="radio-card-sub">Presumptive 44AD/ADA<br>(No Std Ded)</span>
          </div>
          <div class="radio-card ${currentState.employmentType === 'freelancer' ? 'active' : ''}" data-emp="freelancer">
            <span class="radio-card-icon">💻</span>
            <span class="radio-card-title">Freelancer / Pro</span>
            <span class="radio-card-sub">Sec 44ADA 50% Profit<br>(Direct Tax Deductions)</span>
          </div>
        </div>
      </div>

      <!-- Metro City Toggle (HRA) -->
      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label">
          <span class="form-label-text">
            <span>🏙️</span>
            <span>Residential City Category (For HRA Exemption)</span>
          </span>
          <span class="form-hint">50% basic for metro vs 40% non-metro</span>
        </label>
        <div class="pill-switcher" style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px;">
          <button type="button" class="pill-option ${currentState.isMetro ? 'active' : ''}" data-metro="true" style="padding: 10px; text-align: center;">
            🏙️ Metro City (Delhi, Mumbai, Kolkata, Chennai) – 50% Basic
          </button>
          <button type="button" class="pill-option ${!currentState.isMetro ? 'active' : ''}" data-metro="false" style="padding: 10px; text-align: center;">
            🏡 Non-Metro City (All other cities in India) – 40% Basic
          </button>
        </div>
      </div>
    `;

    bindProfileEvents(container);
  }

  function bindProfileEvents(container) {
    const Store = window.TaxClarity.Store;
    if (!Store) return;

    // FY Cards
    const fyCards = container.querySelectorAll('.fy-card');
    fyCards.forEach(card => {
      card.addEventListener('click', () => {
        const fy = card.getAttribute('data-fy');
        fyCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        Store.updateProfile({ financialYear: fy });
      });
    });

    // Age Category Cards
    const ageCards = container.querySelectorAll('.radio-card[data-age]');
    ageCards.forEach(card => {
      card.addEventListener('click', () => {
        const age = card.getAttribute('data-age');
        ageCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        Store.updateProfile({ ageCategory: age });
      });
    });

    // Employment Type Cards
    const empCards = container.querySelectorAll('.radio-card[data-emp]');
    empCards.forEach(card => {
      card.addEventListener('click', () => {
        const emp = card.getAttribute('data-emp');
        empCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        Store.updateProfile({ employmentType: emp });
      });
    });

    // Metro Toggle
    const metroButtons = container.querySelectorAll('.pill-option[data-metro]');
    metroButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const isMetro = btn.getAttribute('data-metro') === 'true';
        metroButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Store.updateProfile({ isMetro });
      });
    });
  }

  return {
    initStepProfile
  };
}));
