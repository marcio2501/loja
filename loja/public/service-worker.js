const CACHE_NAME = "axe-shop-v1";

const urlsToCache = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/logo192.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(
        keys.map(key=>{
          if(key !== CACHE_NAME){
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{

  if(event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(resp=>{
      return resp || fetch(event.request).then(networkResp=>{

        const copy = networkResp.clone();

        caches.open(CACHE_NAME).then(cache=>{
          cache.put(event.request,copy);
        });

        return networkResp;

      }).catch(()=>{
        return caches.match("/");
      });
    })
  );

});