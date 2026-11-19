// Dial's helper for working without the internet (when Dial is installed on a phone, or just opened again offline).
// It only ever talks to Dial's own address. Pages are fetched fresh when there is internet (so updates arrive),
// and come from the saved copy when there is none. Fonts, icons and the skin finder are saved the first time they are used.
const VERSION = 'dial-c1af2b0';
const SHELL = ['./', 'index.html', 'app.html', 'manifest.webmanifest', 'fonts/InstrumentSans.woff2', 'fonts/InstrumentSerif.woff2', 'fonts/InstrumentSerif-Italic.woff2', 'icons/icon-192.png', 'icons/icon-512.png', 'logo/dial-icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;                 // nothing from anywhere else, ever
  const page = r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/');
  if (page) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('app.html'))));
  } else {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)); } return res; })));
  }
});
