const CACHE_VERSION = "v2";
const STATIC_CACHE = `axon-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `axon-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Assets to precache on install
const PRECACHE_URLS = [
    "/offline.html",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// ── Install: precache static shell ─────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// ── Activate: delete old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
                    .map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// ── Fetch: routing strategies ───────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin requests
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    // Skip API calls — always network, never cache
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

    // Navigation requests (HTML pages) — Network-first with offline fallback
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // Static assets (JS, CSS, fonts, images) — Cache-first
    const isStaticAsset =
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.startsWith("/fonts/") ||
        url.pathname.startsWith("/images/") ||
        url.pathname.startsWith("/card-brands/") ||
        /\.(woff2?|ttf|otf|eot|png|jpg|jpeg|svg|ico|webp)$/.test(url.pathname);

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (!response || response.status !== 200) return response;
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Everything else — Network-first, cache as fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                return response;
            })
            .catch(() => caches.match(request))
    );
});
