const CACHE_NAME = 'v92-ghpages-v3';
const CACHED_URLS = [
  '/supreme-v92/',
  '/supreme-v92/interview.html',
  '/supreme-v92/onboard.html',
  '/supreme-v92/manifest.json',
  '/supreme-v92/icon-192.svg',
  '/supreme-v92/icon-512.svg'
];

// Install - cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(CACHED_URLS)).catch(()=>{})
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('firebaseapp') || e.request.url.includes('googleapis')) return;
  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
