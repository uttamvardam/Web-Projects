/**
 * TaxClarity - Offline Service Worker (Network-First Strategy for Instant Live Updates)
 */

const CACHE_NAME = 'taxclarity-v4.2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css?v=4.2',
  './css/components.css?v=4.2',
  './css/styles.css?v=4.2',
  './css/print.css?v=4.2',
  './js/constants.js?v=4.2',
  './js/utils/formatters.js?v=4.2',
  './js/utils/urlSerializer.js?v=4.2',
  './js/state/store.js?v=4.2',
  './js/engine/section87a.js?v=4.2',
  './js/engine/hraCalculator.js?v=4.2',
  './js/engine/deductionsCalculator.js?v=4.2',
  './js/engine/surchargeCalculator.js?v=4.2',
  './js/engine/oldRegimeCalculator.js?v=4.2',
  './js/engine/newRegimeCalculator.js?v=4.2',
  './js/engine/taxEngine.js?v=4.2',
  './js/components/themeManager.js?v=4.2',
  './js/components/wizardStepper.js?v=4.2',
  './js/components/tooltip.js?v=4.2',
  './js/components/hraModal.js?v=4.2',
  './js/components/stepProfile.js?v=4.2',
  './js/components/stepIncome.js?v=4.2',
  './js/components/stepDeductions.js?v=4.2',
  './js/components/verdictBanner.js?v=4.2',
  './js/components/comparisonTable.js?v=4.2',
  './js/components/charts.js?v=4.2',
  './js/components/slabAccordion.js?v=4.2',
  './js/components/optimizerSlider.js?v=4.2',
  './js/components/scenarioManager.js?v=4.2',
  './js/components/stepResults.js?v=4.2',
  './js/components/quickView.js?v=4.2',
  './js/components/resetModal.js?v=4.2'
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

// Network-first fetch strategy with safe fallbacks
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
      return caches.match(event.request).then((cached) => {
        if (cached) return cached;
        // Only return index.html for navigation / HTML document requests
        if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('./index.html');
        }
        return new Response('Not Found', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});
