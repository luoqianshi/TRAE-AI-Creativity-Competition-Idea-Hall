// 牛马自救指南 · Service Worker
// 版本: 1.0.0
// 缓存策略: 主文件网络优先 + 资源文件缓存优先

const CACHE_NAME = 'niujiu-demo-v1.0.0';
const STATIC_CACHE = 'niujiu-static-v1.0.0';

// 需要预缓存的静态资源（图标、关键页面）
const PRECACHE_URLS = [
  './',
  './niujiu-demo-final.html',
  './使用说明.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/maskable-icon-192x192.png',
  './icons/maskable-icon-512x512.png'
];

// 工具页面列表（按需缓存）
const TOOL_PAGES = [
  'banwei-detector', 'breathing-exercise', 'daily-affirmation',
  'daily-quote', 'emotion-firstaid', 'emotion-radio',
  'focus-tomato', 'gratitude-jar', 'leaderboard',
  'mood-barrage', 'mood-blindbox', 'mood-hotline',
  'mood-tracker', 'mood-weather', 'mood-weekly',
  'niujiu-script', 'offwork-countdown', 'slacking-timer',
  'sleep-sound', 'social-graph', 'stress-test',
  'voice-diary', 'wish-list', 'work-anecdote',
  'work-calendar', 'worker-fortune', 'workplace-mbti',
  'worry-shop', 'yearly-report'
];

// 素材文件列表（按需缓存）
const ASSET_FILES = [
  'mascot-calf.png', 'mascot-chick.png', 'mascot-duckling.png',
  'mascot-hug.jpg', 'mascot-kitten.png', 'mascot-monkey.png',
  'mascot-piglet.png', 'mascot-pony.png', 'mascot-puppy.png',
  'mascot-sleep.jpg', 'mascot-tired.jpg'
];

// ===== 安装事件：预缓存关键资源 =====
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      // 立即激活，不等待旧SW退出
      return self.skipWaiting();
    })
  );
});

// ===== 激活事件：清理旧缓存 =====
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            return name !== CACHE_NAME && name !== STATIC_CACHE;
          })
          .map(function(name) {
            return caches.delete(name);
          })
      );
    }).then(function() {
      // 接管所有客户端
      return self.clients.claim();
    })
  );
});

// ===== 请求拦截 =====
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  // 只处理同源请求
  if (requestUrl.origin !== location.origin) return;

  // 主HTML文件：网络优先，失败回退缓存
  if (requestUrl.pathname.endsWith('.html') && 
      (requestUrl.pathname.includes('niujiu-demo-final') || requestUrl.pathname === '/')) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // 网络成功，更新缓存
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(function() {
          // 网络失败，回退缓存
          return caches.match(event.request).then(function(cached) {
            return cached || caches.match('./niujiu-demo-final.html');
          });
        })
    );
    return;
  }

  // 工具页面：缓存优先
  if (requestUrl.pathname.startsWith('/pages/')) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // 静态资源（图标、图片、字体）：缓存优先
  if (requestUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|woff2|woff|ttf|css|js)$/)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // manifest.json：网络优先
  if (requestUrl.pathname.endsWith('manifest.json')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // 其他请求：直接放行
  return;
});
