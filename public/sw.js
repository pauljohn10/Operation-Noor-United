// Service Worker for Al Noor United Station Audit PWA
const CACHE_NAME = 'alnoor-audit-v1';

// Install event: immediate takeover
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: immediate client claim & cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message listener to trigger immediate skip waiting on update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event: Network-first strategy to guarantee live updates with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Don't intercept Supabase API calls or non-http protocols
  const url = new URL(event.request.url);
  if (url.origin.includes('supabase.co') || !url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, update cache asynchronously
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline), try fallback from cache
        return caches.match(event.request);
      })
  );
});
