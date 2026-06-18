/* eslint-disable no-restricted-globals */
const CACHE_VERSION = "v1.2.0-pomegranate";
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![APP_SHELL_CACHE, STATIC_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin === "https://assets.emergent.sh") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(API_CACHE).then((cache) => {
            if (res.ok) cache.put(request, copy).catch(() => {});
          });
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put("/", copy).catch(() => {}));
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match(request)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy).catch(() => {}));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
