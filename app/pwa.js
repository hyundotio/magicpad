let cacheName = "mp15101";

let contentToCache = ["css/main.css","css_include/reset.css","favicon/android-icon-144x144.png","favicon/android-icon-192x192.png","favicon/android-icon-36x36.png","favicon/android-icon-48x48.png","favicon/android-icon-512x512.png","favicon/android-icon-72x72.png","favicon/android-icon-96x96.png","favicon/apple-icon-114x114.png","favicon/apple-icon-120x120.png","favicon/apple-icon-144x144.png","favicon/apple-icon-152x152.png","favicon/apple-icon-180x180.png","favicon/apple-icon-57x57.png","favicon/apple-icon-60x60.png","favicon/apple-icon-72x72.png","favicon/apple-icon-76x76.png","favicon/apple-icon-precomposed.png","favicon/apple-icon.png","favicon/browserconfig.xml","favicon/favicon-16x16.png","favicon/favicon-32x32.png","favicon/favicon-96x96.png","favicon/favicon.ico","favicon/ms-icon-144x144.png","favicon/ms-icon-150x150.png","favicon/ms-icon-310x310.png","favicon/ms-icon-70x70.png","fonts/ibmplexmono-regular-webfont.ttf","fonts/ibmplexmono-regular-webfont.woff","fonts/ibmplexmono-regular-webfont.woff2","fonts/ibmplexsans-bold-webfont.ttf","fonts/ibmplexsans-bold-webfont.woff","fonts/ibmplexsans-bold-webfont.woff2","fonts/ibmplexsans-light-webfont.ttf","fonts/ibmplexsans-light-webfont.woff","fonts/ibmplexsans-light-webfont.woff2","fonts/ibmplexsans-regular-webfont.ttf","fonts/ibmplexsans-regular-webfont.woff","fonts/ibmplexsans-regular-webfont.woff2","fonts/stylesheet.css","index.html","js/main.js","js_include/jquery-3.4.1.min.js","js_include/openpgp.min.js","js_include/steganography.min.js","manifest.json","ui/copy.svg","ui/decrypt.svg","ui/download.svg","ui/dropdown.svg","ui/encrypt.svg","ui/exit-black.svg","ui/exit.svg","ui/expand.svg","ui/generate.svg","ui/menu.svg","ui/minimize.svg","ui/popup.svg","ui/purge.svg","ui/remove.svg","ui/restart.svg","ui/save.svg","ui/selectfile.svg","ui/upload.svg","webapp/apple-launch-1125x2436.png","webapp/apple-launch-1242x2208.png","webapp/apple-launch-1242x2688.png","webapp/apple-launch-1536x2048.png","webapp/apple-launch-1668x2224.png","webapp/apple-launch-1668x2388.png","webapp/apple-launch-2048x1536.png","webapp/apple-launch-2048x2732.png","webapp/apple-launch-2224x1668.png","webapp/apple-launch-2388x1668.png","webapp/apple-launch-2732x2048.png","webapp/apple-launch-750x1334.png","webapp/apple-launch-828x1792.png"];

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      //console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(contentToCache);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
          //console.log('[Service Worker] Fetching resource: '+e.request.url);
          return r || fetch(e.request).then((response) => {
              return caches.open(cacheName).then((cache) => {
                  //console.log('[Service Worker] Caching new resource: '+e.request.url);
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
