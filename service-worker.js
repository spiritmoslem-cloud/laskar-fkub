const CACHE = 'laskar-fkub-v1.2';
const ASSETS = [
  '/laskar-fkub/',
  '/laskar-fkub/index.html',
  '/laskar-fkub/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first untuk HTML — selalu cek server dulu
  if (e.request.mode === 'navigate' || e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first untuk aset lain (manifest, icon)
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
