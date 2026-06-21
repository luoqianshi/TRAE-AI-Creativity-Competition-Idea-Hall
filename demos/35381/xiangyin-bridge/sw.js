/**
 * 乡音桥 Service Worker
 * 支持离线缓存，让老人在无网络时也能使用基础功能
 */

const CACHE_NAME = 'xiangyin-bridge-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求，优先使用缓存
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存命中，直接返回
                if (response) {
                    return response;
                }
                
                // 未命中，发起网络请求
                return fetch(event.request)
                    .then(networkResponse => {
                        // 缓存新请求
                        if (networkResponse.ok) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, clone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // 网络失败，返回离线页面
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});