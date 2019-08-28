window.addEventListener('load', () => {
  if (!('serviceWorker' in navigator)) {
    return
  }
  navigator.serviceWorker.register('./js/pwa.js').then(
    () => {
    },
    err => {
      console.error('SW registration failed!', err)
    }
  )
})

if (('serviceWorker' in navigator)) {
  self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
      caches.open(cacheName).then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(contentToCache);
      })
    );
  });

  self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((r) => {
            console.log('[Service Worker] Fetching resource: '+e.request.url);
            return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
                    console.log('[Service Worker] Caching new resource: '+e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                  });
            });
      })
    );
  });
  self.addEventListener('activate', (event) => {
      let cacheKeeplist = [cacheName];
      event.waitUntil(
        caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
            if (cacheKeeplist.indexOf(key) === -1) {
              return caches.delete(key);
            }
          }));
        })
      );
    });
}
