/* Minimal service worker for PWA install and basic lifecycle */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No fetch interception to avoid caching pitfalls by default.

