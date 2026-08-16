/**
 * TaxClarity - Theme Switcher Manager
 * Defaults to Clean Light Theme matching the SaaS Dashboard reference image
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.ThemeManager = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'taxclarity_theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  let currentTheme = THEME_LIGHT;

  /**
   * Initializes theme on page load (defaults to light theme)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === THEME_DARK) {
      setTheme(THEME_DARK);
    } else {
      setTheme(THEME_LIGHT);
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
  }

  function setTheme(theme) {
    currentTheme = (theme === THEME_DARK) ? THEME_DARK : THEME_LIGHT;
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem(STORAGE_KEY, currentTheme);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.innerHTML = (currentTheme === THEME_DARK) ? '☀️' : '🌙';
      toggleBtn.setAttribute('aria-label', `Switch to ${currentTheme === THEME_DARK ? 'Light' : 'Dark'} mode`);
      toggleBtn.setAttribute('title', `Switch to ${currentTheme === THEME_DARK ? 'Light' : 'Dark'} mode`);
    }
  }

  function toggleTheme() {
    const nextTheme = (currentTheme === THEME_LIGHT) ? THEME_DARK : THEME_LIGHT;
    setTheme(nextTheme);
  }

  return {
    initTheme,
    setTheme,
    toggleTheme,
    getCurrentTheme: () => currentTheme
  };
}));
