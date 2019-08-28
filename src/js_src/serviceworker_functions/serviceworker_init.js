if ("serviceWorker" in navigator && location.protocol == 'https:') {
  if (navigator.serviceWorker.controller) {
    //console.log("[PWA Builder] active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("./pwa.js", {
        scope: "./"
      })
      .then(function (reg) {
        //console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
      });
  }
}
