self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // A minimum viable service worker must have a fetch event handler
    // to pass the PWA installation criteria in some browsers.
    event.respondWith(
        fetch(event.request).catch(error => {
            // Very basic fallback if offline
            return new Response(
                '<html><body><h1>Você está offline</h1><p>Conecte-se à internet para usar o Bizu! Portal.</p></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
        })
    );
});
