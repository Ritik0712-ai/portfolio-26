// KILL SWITCH — this file used to be a cache-first service worker.
//
// The old version did this:
//     caches.match(request).then(r => r ? r : fetch(request))
// i.e. cache always wins, for every request, forever. It pre-cached
// /, /about, /projects, /blog and /contact at install time and used a
// hardcoded CACHE_NAME ('ritik-portfolio-v1') that never changed, so the
// activate-cleanup never removed anything.
//
// Next.js ships content-hashed JS chunks whose filenames change on every
// build. A visitor's browser therefore kept serving HTML from their first
// visit, which referenced chunk filenames that later deploys deleted. The
// scripts 404, hydration never runs, and the page renders blank — while a
// browser that never registered the worker sees the site perfectly.
//
// A service worker stays registered even after the code that registered it
// is removed, so the only way to clean up existing visitors is to publish a
// worker that removes itself. That is all this file does now.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.navigate(client.url));
  })());
});

// Deliberately no 'fetch' handler — every request goes straight to the network.
