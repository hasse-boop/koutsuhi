/* 交通費精算 Service Worker
   画面はネット優先(更新をすぐ反映)、つながらない時は保存済みの版を表示する。
   アイコン等はキャッシュ優先。ファイル構成を変えたら CACHE の番号を上げる。 */
var CACHE = "koutsuhi-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(function(res){
        if (res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put("./index.html", copy); });
        }
        return res;
      }).catch(function(){ return caches.match("./index.html"); })
    );
    return;
  }

  e.respondWith(caches.match(req).then(function(hit){ return hit || fetch(req); }));
});
