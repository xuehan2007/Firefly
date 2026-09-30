/*
 * Firefly 博客 Service Worker
 * 策略：
 *  - 页面（导航请求）：缓存优先 + 后台更新（stale-while-revalidate），离线时兜底
 *  - 静态资源（_astro / uploads / favicon / 字体图片等）：缓存优先，最多 80 条
 *  - /api、/dashboard、/admin 一律不走缓存，保证后台与数据实时
 */

const VERSION = 'firefly-v1';
const PAGE_CACHE = VERSION + '-pages';
const ASSET_CACHE = VERSION + '-assets';

const DISALLOWED = ['/api/', '/dashboard', '/admin'];

const ASSET_RE =
  /^\/(_astro|uploads|assets|favicon|gallery|pio)\//;
const ASSET_EXT =
  /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico|json|webmanifest|mp3|wav|mp4)$/;

self.addEventListener('install', (event) => {
  // 预缓存首页，作为离线入口
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.add('/'))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== PAGE_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// 限制缓存条数，超出时删除最早的条目
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) {
    await Promise.all(
      keys.slice(0, keys.length - max).map((req) => cache.delete(req))
    );
  }
}

function offlineResponse() {
  const html =
    '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>离线状态</title></head>' +
    '<body style="margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0f1a;color:#e6edf3;font-family:system-ui,sans-serif">' +
    '<div style="font-size:3rem;margin-bottom:12px">📡</div>' +
    '<h2 style="margin:0 0 8px">当前处于离线状态</h2>' +
    '<p style="margin:0;color:#9aa7b4;text-align:center;padding:0 20px">这篇内容还没有缓存，联网后再打开一次即可离线阅读。</p>' +
    '</body></html>';
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 第三方资源不缓存
  if (DISALLOWED.some((p) => url.pathname.startsWith(p))) return;

  // 页面导航：SWR —— 有缓存先返回缓存，同时后台更新
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        const cached = await cache.match(req);

        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              cache.put(req, res.clone());
              trimCache(PAGE_CACHE, 15);
            }
            return res;
          })
          .catch(() => null);

        return cached || (await network) || offlineResponse();
      })()
    );
    return;
  }

  // 静态资源：缓存优先
  if (ASSET_RE.test(url.pathname) || ASSET_EXT.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(req);
        if (cached) {
          // 后台静默更新
          fetch(req)
            .then((res) => {
              if (res && res.ok) cache.put(req, res.clone());
            })
            .catch(() => {});
          return cached;
        }
        try {
          const res = await fetch(req);
          if (res && res.ok) {
            cache.put(req, res.clone());
            trimCache(ASSET_CACHE, 80);
          }
          return res;
        } catch {
          return offlineResponse();
        }
      })()
    );
  }
});

// 页面可通过 postMessage 触发立即更新
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
