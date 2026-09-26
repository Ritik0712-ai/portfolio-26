/* RitikOS service worker — makes /magic installable and usable offline.
 *
 * Scope is /magic only, so the classic site is never controlled by a worker
 * (see /sw.js for why that matters). Strategy:
 *   • pages (navigations): network first, cached copy when offline
 *   • /_next/static, fonts, icons, images: cache first (file names are
 *     content-hashed or immutable, so a cached copy can never go stale)
 *   • content APIs: network first, cached copy when offline
 * Bump VERSION to drop every cache on the next visit.
 */
const VERSION = 'ritikos-v1';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const API = `${VERSION}-api`;
const PRECACHE = ['/magic', '/magic/mac', '/magic/android', '/magic/windows', '/ritikos.webmanifest', '/icons/ritikos-192.png'];
const API_CACHE = ['/api/projects', '/api/blogs', '/api/timeline', '/api/certifications', '/api/testimonials', '/api/stats', '/api/dsa'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n.startsWith('ritikos-') && !n.startsWith(VERSION)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) || (fallbackUrl && (await caches.match(fallbackUrl))) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    if (url.origin === location.origin && url.pathname.startsWith('/magic')) {
      event.respondWith(networkFirst(request, PAGES, '/magic'));
    }
    return;
  }
  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/os-icons/') || url.pathname.startsWith('/icons/') || /\.(?:png|jpe?g|webp|svg|woff2?)$/.test(url.pathname)) {
      event.respondWith(cacheFirst(request));
      return;
    }
    if (API_CACHE.some((p) => url.pathname === p)) {
      event.respondWith(networkFirst(request, API));
    }
    return;
  }
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'i.scdn.co') {
    event.respondWith(cacheFirst(request));
  }
});
