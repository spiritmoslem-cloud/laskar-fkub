const CACHE = 'kardiodoc-v1';
const ASSETS = [
  '/laskar-fkub/',
  '/laskar-fkub/index.html',
  '/laskar-fkub/manifest.json',
  '/laskar-fkub/styles.css',
  '/laskar-fkub/data.js',
  '/laskar-fkub/logo.js',
  '/laskar-fkub/shared.jsx',
  '/laskar-fkub/variant-a.jsx',
  '/laskar-fkub/tweaks-panel.jsx',
  '/laskar-fkub/icon-192.png',
  '/laskar-fkub/icon-512.png'
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
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
