const CACHE_NAME = "dca-cache-v2"; // Increment for update
const OFFLINE_URLS = ["/", "/index.html", "/manifest.json"];

// Assets with hashes (Vite build) should be cached forever
const IMMUTABLE_ASSETS = [
  /assets\/index-.*\.js$/,
  /assets\/index-.*\.css$/,
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force all clients to reload to pick up the new version
      return self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          if (client.url && "navigate" in client) {
            client.navigate(client.url);
          }
        });
      });
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Use Network First for navigation and root URLs to avoid stale index.html
  if (event.request.mode === "navigate" || OFFLINE_URLS.includes(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Use Cache First for static/hashed assets
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request).then((response) => {
        // Cache static assets on the fly if they match our pattern
        if (IMMUTABLE_ASSETS.some(regex => regex.test(url.pathname))) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
        }
        return response;
      });
    })
  );
});
