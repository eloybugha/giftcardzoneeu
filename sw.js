// sw.js — simple offline fallback
const CACHE_NAME = "gczeu-safe-v1";
const PRECACHE_URLS = ["/", "/index.html", "/pre.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
