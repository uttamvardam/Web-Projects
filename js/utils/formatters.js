/**
 * TaxClarity - Indian Currency Formatter & Number to Words Utility
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.Formatters = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Formats a number to Indian Rupee currency format (e.g. ₹ 15,00,000)
   * 
   * @param {number|string} amount 
   * @param {boolean} [includeSymbol=true] 
   * @returns {string} Formatted string
   */
  function formatINR(amount, includeSymbol = true) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return includeSymbol ? '₹ 0' : '0';
    }

    const num = Math.round(Number(amount));
    const formatted = new Intl.NumberFormat('en-IN').format(num);
    return includeSymbol ? `₹ ${formatted}` : formatted;
  }

  /**
   * Parses an INR formatted string or user input into a clean numeric value
   * 
   * @param {string|number} str 
   * @returns {number} Clean integer/float
   */
  function parseINR(str) {
    if (typeof str === 'number') return isNaN(str) ? 0 : str;
    if (!str) return 0;
    
    // Remove all characters except digits, minus sign, and period
    const cleanStr = String(str).replace(/[^\d.-]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : Math.round(val);
  }

  /**
   * Converts a numeric rupee value into readable words in the Indian numbering system
   * (Crores, Lakhs, Thousands, Hundreds)
   * 
   * @param {number} amount 
   * @returns {string} e.g. "Fifteen Lakh Fifty Thousand Rupees"
   */
  function numberToIndianWords(amount) {
    const num = parseINR(amount);
    if (num <= 0) return 'Zero Rupees';

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function twoDigitsToWords(n) {
      if (n < 20) return units[n];
      const digitTens = Math.floor(n / 10);
      const digitUnits = n % 10;
      return tens[digitTens] + (digitUnits !== 0 ? ' ' + units[digitUnits] : '');
    }

    function threeDigitsToWords(n) {
      let str = '';
      if (Math.floor(n / 100) > 0) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 0) {
        str += twoDigitsToWords(n);
      }
      return str.trim();
    }

    let remaining = num;
    let words = '';

    // Crores (10,000,000)
    const crores = Math.floor(remaining / 10000000);
    if (crores > 0) {
      words += twoDigitsToWords(crores) + ' Crore ';
      remaining %= 10000000;
    }

    // Lakhs (100,000)
    const lakhs = Math.floor(remaining / 100000);
    if (lakhs > 0) {
      words += twoDigitsToWords(lakhs) + ' Lakh ';
      remaining %= 100000;
    }

    // Thousands (1,000)
    const thousands = Math.floor(remaining / 1000);
    if (thousands > 0) {
      words += twoDigitsToWords(thousands) + ' Thousand ';
      remaining %= 1000;
    }

    // Hundreds & remaining
    if (remaining > 0) {
      words += threeDigitsToWords(remaining);
    }

    return (words.trim() + ' Rupees').replace(/\s+/g, ' ');
  }

  return {
    formatINR,
    parseINR,
    numberToIndianWords
  };
}));
