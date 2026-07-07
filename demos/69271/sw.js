/**
 * 片刻 Pianke — Service Worker
 * 提供离线缓存和静态资源加速
 */
const CACHE_NAME = 'pianke-demo-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/js/camera.js',
  '/assets/js/data.js'
];

// 安装：缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(() => {
      // 静默失败，不影响使用
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 拦截请求：优先网络，失败时回退缓存
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 跳过非 GET 请求和 Chrome 扩展请求
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  // 对 Unsplash/Picsum 等图片使用 Cache First
  if (request.url.includes('images.unsplash.com') || request.url.includes('picsum.photos')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        return fetch(request).then((fetchResponse) => {
          if (fetchResponse.ok) {
            const clone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return fetchResponse;
        });
      })
    );
    return;
  }

  // 对静态资源和 API 使用 Network First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});