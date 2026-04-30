const CACHE_NAME = "axe-shop-v7";

/* arquivos fixos do app */
const urlsToCache = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/logo192.png"
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();

});

/* =========================
   ACTIVATE
========================= */
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })

      );

    })

  );

  self.clients.claim();

});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  /* =========================
     API dinâmica
     nunca cacheia vitrine/busca
  ========================= */
  if (
    url.pathname.startsWith("/produtos") ||
    url.pathname.startsWith("/buscar")
  ) {

    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => {
        return new Response(
          JSON.stringify({
            data:{
              productOfferV2:{
                nodes:[]
              }
            }
          }),
          {
            headers:{
              "Content-Type":"application/json"
            }
          }
        );
      })
    );

    return;
  }

  /* =========================
     arquivos estáticos
  ========================= */
  event.respondWith(

    caches.match(event.request).then(cacheResp => {

      if (cacheResp) {
        return cacheResp;
      }

      return fetch(event.request).then(networkResp => {

        if (
          !networkResp ||
          networkResp.status !== 200 ||
          networkResp.type !== "basic"
        ) {
          return networkResp;
        }

        const copy = networkResp.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });

        return networkResp;

      }).catch(() => {

        return caches.match("/") || Response.error();

      });

    })

  );

});
