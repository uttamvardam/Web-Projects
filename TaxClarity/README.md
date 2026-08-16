# ⚖️ TaxClarity – Indian Income Tax Calculator & Regime Comparator

> **100% Client-Side, Private, Interactive Indian Income Tax Calculator & Regime Comparator for FY 2024–25 (AY 2025–26) and FY 2025–26 (AY 2026–27).**

TaxClarity is an institutional-grade, privacy-first web application engineered to give Indian taxpayers transparent, mathematically rigorous comparisons between the **Old Tax Regime** and **New Tax Regime (Section 115BAC)** under the latest Union Budget provisions.

---

## 🌟 Key Features

### 1. 100% Client-Side Local Execution (Zero Server Calls)
- Complete financial privacy guarantee: All calculations, HRA formulas, slab math, and scenario persistence execute **100% locally in your browser**.
- Zero outbound network requests containing salary or tax data.

### 2. Up-to-Date Budget Slabs & Deductions
- **FY 2024–25 & FY 2025–26 Tax Slabs:** Section 115BAC new tax regime slabs and standard deduction of **₹75,000** (New Regime) vs **₹50,000** (Old Regime).
- **Section 87A Rebate & Marginal Relief:** Full rebate up to ₹7,00,000 under the New Regime and mathematical Marginal Relief between ₹7,00,001 and ₹7,27,777.
- **Section 10(13A) 3-Rule HRA Engine:** Compares Actual HRA, Rent minus 10% Basic, and 50%/40% Basic with one-click auto-application.
- **Chapter VI-A Statutory Caps:** Section 80C (₹1.5 Lakh limit with live progress bar), Section 80D (Health Insurance with senior citizen awareness), Section 80CCD(1B) NPS (₹50,000), Section 80CCD(2), Section 24(b) Home Loan Interest, Section 80E, 80G, and 80TTA / 80TTB.
- **Surcharge & Cess:** 10%, 15%, 25%, and 37% (Old Regime) surcharge with Surcharge Marginal Relief on boundary incomes plus 4% Health & Education Cess.

### 3. Visual Analytics & Comparative Dashboard
- **Savings Verdict Hero Banner:** Celebrates the winning regime and reports annual and monthly in-hand delta.
- **Side-by-Side Tax Ledger:** Dual-column matrix comparing gross income, deductions, taxable base, and monthly in-hand pay.
- **Interactive SVG Charts:** Income Allocation Donut chart (Take-Home vs Tax Paid) and comparative tax liability bars.
- **Slab-by-Slab Breakdown Accordion:** Detailed bracket-by-bracket math for both regimes.

### 4. Advanced Decision Tools
- **"What-If" Breakeven Tax-Saving Optimizer:** Interactive slider simulating additional investments to find the exact crossover point where Old Regime beats New Regime.
- **Multi-Scenario LocalStorage Manager:** Save, load, duplicate, and export JSON backups of multiple financial setups locally.
- **Executive PDF / Print Reports:** Dedicated `@media print` stylesheet producing clean, professional A4 tax audit sheets for HR proof submission.
- **Privacy-Safe Shareable Links:** Encodes calculation states into URL hashes (`#calc=...`) for instant private bookmarking.
- **PWA 100% Offline Capability:** Progressive Web App with service worker caching for reliable offline calculation on desktop and mobile.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v16+) installed.

### Running Dev Server
```powershell
npm run dev
# Or: node server.js
```
Open your browser at:
**`http://localhost:3000`**

### Running Automated Test Suite
```powershell
npm test
# Or: node js/tests/testSuite.js
```

---

## 🏗️ Architecture & Directory Structure

```
TaxClarity/
├── css/
│   ├── variables.css          # Design tokens (Dark/Light themes, typography, colors)
│   ├── components.css         # Glassmorphic cards, currency inputs, stepper, tooltips
│   ├── styles.css             # Main layout, header, footer, a11y, animations
│   └── print.css              # Executive @media print stylesheet for PDF/print export
├── js/
│   ├── constants.js           # Statutory tax slabs, deduction limits, surcharge tiers
│   ├── engine/
│   │   ├── hraCalculator.js         # Section 10(13A) 3-rule calculator
│   │   ├── deductionsCalculator.js  # Chapter VI-A & Section 24(b) aggregator
│   │   ├── oldRegimeCalculator.js   # Old Regime slab arithmetic & 87A rebate
│   │   ├── newRegimeCalculator.js   # Section 115BAC slabs, ₹75k Std Ded, 87A Marginal Relief
│   │   ├── surchargeCalculator.js   # Surcharge, Surcharge Marginal Relief, 4% Cess
│   │   └── taxEngine.js             # Master comparator, verdict & breakeven optimizer
│   ├── state/
│   │   └── store.js                 # Central reactive state bus (< 10ms updates)
│   ├── utils/
│   │   ├── formatters.js            # INR currency formatter & Indian number-to-words
│   │   └── urlSerializer.js         # Privacy-safe URL state encoder & decoder
│   ├── components/
│   │   ├── themeManager.js          # Dark / Light theme toggle with persistence
│   │   ├── wizardStepper.js         # 4-step stepper and single-page view toggle
│   │   ├── tooltip.js               # Accessible tax education tooltips
│   │   ├── hraModal.js              # Interactive 3-condition HRA modal
│   │   ├── stepProfile.js           # Step 1: FY, Age & Employment profile
│   │   ├── stepIncome.js            # Step 2: Salary CTC breakdown & other income
│   │   ├── stepDeductions.js        # Step 3: Section 80C hub & 80D cards
│   │   ├── verdictBanner.js         # Step 4: Glowing recommendation hero card
│   │   ├── comparisonTable.js       # Step 4: Side-by-side ledger matrix
│   │   ├── charts.js                # Step 4: SVG Donut & comparative bars
│   │   ├── slabAccordion.js         # Step 4: Collapsible slab breakdown
│   │   ├── optimizerSlider.js       # Step 4: "What-If" breakeven slider
│   │   ├── scenarioManager.js       # LocalStorage scenario modal & JSON export
│   │   ├── stepResults.js           # Step 4: Master results dashboard integrator
│   │   └── quickView.js             # Two-column single-page expert mode
│   └── tests/
│       └── testSuite.js             # 52 automated unit test assertions (100% passing)
├── manifest.json              # PWA Web App Manifest
├── sw.js                      # Service Worker for 100% offline usage
├── index.html                 # Semantic HTML5 app shell
├── server.js                  # Zero-dependency local Node server
├── package.json               # Project manifest
├── PRD.md                     # Product Requirements Document
└── tasks.md                   # Atomic, phased task breakdown (100% completed)
```

---

## 📜 License
MIT License. Built for Indian taxpayers with ❤️ and 100% privacy guarantee.
