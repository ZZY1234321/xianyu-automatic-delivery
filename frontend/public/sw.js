// 简单的 Service Worker
const CACHE_NAME = 'guangfengjiyue-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 拦截请求，使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有，返回缓存，否则从网络获取
        return response || fetch(event.request);
      })
  );
});

// 激活 Service Worker，清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
