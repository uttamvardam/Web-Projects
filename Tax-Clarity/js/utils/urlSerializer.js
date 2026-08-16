/**
 * TaxClarity - Privacy-Safe URL State Serializer
 * Encodes and restores calculation state in URL hash without any outbound server requests
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxClarity = root.TaxClarity || {};
    root.TaxClarity.URLSerializer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function encodeState(state) {
    try {
      const payload = {
        p: state.profile,
        i: state.income,
        d: state.deductions
      };
      const json = JSON.stringify(payload);
      return btoa(encodeURIComponent(json));
    } catch (e) {
      console.error('Error encoding state to URL:', e);
      return '';
    }
  }

  function decodeState(hashString) {
    try {
      if (!hashString) return null;
      const cleanHash = hashString.replace(/^#/, '').replace(/^calc=/, '');
      if (!cleanHash) return null;

      const json = decodeURIComponent(atob(cleanHash));
      const payload = JSON.parse(json);

      if (payload && payload.p && payload.i && payload.d) {
        return {
          profile: payload.p,
          income: payload.i,
          deductions: payload.d
        };
      }
      return null;
    } catch (e) {
      console.error('Error decoding state from URL:', e);
      return null;
    }
  }

  function copyShareableLink() {
    const Store = window.TaxClarity.Store;
    if (!Store) return;

    const state = Store.getState();
    const encoded = encodeState(state);
    const url = `${window.location.origin}${window.location.pathname}#calc=${encoded}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert('📋 Shareable link copied to clipboard!\n\nAll data is encoded strictly inside the link URL (100% private, zero server storage).');
      }).catch(() => {
        prompt('Copy your private calculation URL:', url);
      });
    } else {
      prompt('Copy your private calculation URL:', url);
    }
  }

  function restoreFromURL() {
    if (window.location.hash) {
      const restored = decodeState(window.location.hash);
      if (restored) {
        const Store = window.TaxClarity.Store;
        if (Store) {
          Store.loadScenarioState(restored);
        }
      }
    }
  }

  return {
    encodeState,
    decodeState,
    copyShareableLink,
    restoreFromURL
  };
}));
