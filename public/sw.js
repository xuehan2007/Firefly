/*
 * Firefly 博客 Service Worker
 * 策略：
 *  - 页面（导航请求）：网络优先（network-first），离线时回退缓存
 *      —— 在线时永远拿到最新 HTML，彻底避免“旧 HTML 引用已被淘汰的
 *         hash 资源 → 无样式页”以及新旧版本混用时的竞态
 *  - 静态资源（_astro / uploads / favicon / 字体图片等）：缓存优先 + 后台更新
 *  - /api、/dashboard、/admin 一律不走缓存，保证后台与数据实时
 *
 * 更新机制（v2）：
 *  - 新版本 install 后不再 skipWaiting 抢控页面，而是等待；
 *    页面检测到等待中的 SW，弹出“网站已更新 → 刷新”提示，
 *    用户确认后再激活并刷新，避免激活竞态打断正在进行的请求。
 */

const VERSION = 'firefly-v2';
const PAGE_CACHE = VERSION + '-pages';
const ASSET_CACHE = VERSION + '-assets';

const DISALLOWED = ['/api/', '/dashboard', '/admin'];

const ASSET_RE =
  /^\/(_astro|uploads|assets|favicon|gallery|pio)\//;
const ASSET_EXT =
  /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico|json|webmanifest|mp3|wav|mp4)$/;

self.addEventListener('install', (event) => {
  // 预缓存首页，作为离线入口；不调用 skipWaiting —— 等用户确认更新
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.add('/'))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 清掉所有旧版本缓存（缓存名带版本号，升版即整体作废）
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== PAGE_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      );
      // 不调用 clients.claim()：由用户确认更新后的整页刷新自然接管，
      // 避免新 SW 在旧页面生命周期内突然接管造成请求中断。
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

  // 页面导航：network-first —— 在线用网络并刷新缓存，离线才回退
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        try {
          const res = await fetch(req);
          if (res && res.ok) {
            cache.put(req, res.clone());
            trimCache(PAGE_CACHE, 15);
          }
          return res;
        } catch {
          const cached = await cache.match(req);
          return cached || offlineResponse();
        }
      })()
    );
    return;
  }

  // 静态资源：缓存优先，后台静默更新
  if (ASSET_RE.test(url.pathname) || ASSET_EXT.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(req);
        if (cached) {
          // 后台静默更新（hash 资源内容不变，非 hash 资源也能逐步刷新）
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
            trimCache(ASSET_CACHE, 400);
          }
          return res;
        } catch {
          return offlineResponse();
        }
      })()
    );
  }
});

// 页面可通过 postMessage 触发立即更新（用户点击“刷新”后调用）
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
