/**
 * TaxClarity - Offline Service Worker (Network-First Strategy for Instant Live Updates)
 */

const CACHE_NAME = 'taxclarity-v4.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css?v=4.0',
  './css/components.css?v=4.0',
  './css/styles.css?v=4.0',
  './css/print.css?v=4.0',
  './js/constants.js?v=4.0',
  './js/utils/formatters.js?v=4.0',
  './js/utils/urlSerializer.js?v=4.0',
  './js/state/store.js?v=4.0',
  './js/engine/section87a.js?v=4.0',
  './js/engine/hraCalculator.js?v=4.0',
  './js/engine/deductionsCalculator.js?v=4.0',
  './js/engine/surchargeCalculator.js?v=4.0',
  './js/engine/oldRegimeCalculator.js?v=4.0',
  './js/engine/newRegimeCalculator.js?v=4.0',
  './js/engine/taxEngine.js?v=4.0',
  './js/components/themeManager.js?v=4.0',
  './js/components/wizardStepper.js?v=4.0',
  './js/components/tooltip.js?v=4.0',
  './js/components/hraModal.js?v=4.0',
  './js/components/stepProfile.js?v=4.0',
  './js/components/stepIncome.js?v=4.0',
  './js/components/stepDeductions.js?v=4.0',
  './js/components/verdictBanner.js?v=4.0',
  './js/components/comparisonTable.js?v=4.0',
  './js/components/charts.js?v=4.0',
  './js/components/slabAccordion.js?v=4.0',
  './js/components/optimizerSlider.js?v=4.0',
  './js/components/scenarioManager.js?v=4.0',
  './js/components/stepResults.js?v=4.0',
  './js/components/quickView.js?v=4.0',
  './js/components/resetModal.js?v=4.0'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first fetch strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
    })
  );
});
