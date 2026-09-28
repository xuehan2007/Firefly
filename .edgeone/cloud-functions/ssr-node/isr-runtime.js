/**
 * ISR (Incremental Static Regeneration) runtime for the EdgeOne Astro adapter.
 *
 * Extracted from the generated handler so server-entry.ts stays thin. Compiled
 * to dist/lib/isr-runtime.js and copied next to the generated handler.js in the
 * server-handler directory at build time; it reads the build-time manifests
 * (isr-manifest.json / tag-manifest.json) from that same directory.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const ISR_SWR_WINDOW = 31536000; // 1 year stale-while-revalidate window
export const REVALIDATE_ENDPOINT = '/__edgeone_revalidate';
const __handlerDir = dirname(fileURLToPath(import.meta.url));
function loadJson(filename, fallback) {
    for (const candidate of [resolve(__handlerDir, filename), resolve(process.cwd(), filename)]) {
        if (existsSync(candidate)) {
            try {
                return JSON.parse(readFileSync(candidate, 'utf-8'));
            }
            catch {
                // try next candidate
            }
        }
    }
    return fallback;
}
let _isrRoutes = null;
function getIsrRoutes() {
    if (_isrRoutes)
        return _isrRoutes;
    _isrRoutes = [];
    const manifest = loadJson('isr-manifest.json', { version: 1, routes: [] });
    for (const r of manifest?.routes || []) {
        if (!r?.src)
            continue;
        try {
            _isrRoutes.push({ re: new RegExp(r.src), revalidate: r.revalidate, tags: r.tags || [] });
        }
        catch {
            // skip invalid pattern
        }
    }
    return _isrRoutes;
}
let _tagManifest = null;
function getTagManifest() {
    if (!_tagManifest)
        _tagManifest = loadJson('tag-manifest.json', { version: 1, tags: {} });
    return _tagManifest;
}
function matchIsrRoute(pathname) {
    for (const route of getIsrRoutes()) {
        if (route.re.test(pathname))
            return route;
    }
    return null;
}
/** Real user-facing host. EdgeOne rewrites Host to the origin; real host is in `eo-pages-host`. */
function getRealHost(req) {
    const h = req?.headers || {};
    return h['eo-pages-host'] || h['x-forwarded-host'] || h['host'] || process.env.SITE_HOST || '';
}
function expandTagsToPaths(tags) {
    const manifest = getTagManifest();
    const paths = new Set();
    for (const tag of tags) {
        const mapped = manifest?.tags?.[tag];
        if (Array.isArray(mapped) && mapped.length) {
            for (const p of mapped)
                paths.add(p);
        }
        else {
            paths.add(tag);
        }
    }
    return Array.from(paths);
}
async function purgeEdgeCache(paths, host) {
    if (!paths || paths.length === 0)
        return { purged: 0 };
    if (!host) {
        console.error('[astro] Cannot purge: no host (eo-pages-host header or SITE_HOST env)');
        return { purged: 0, error: 'no-host' };
    }
    // Only concrete paths can be purged as URLs; skip dynamic patterns (**, :id, [id]).
    const isConcrete = (p) => typeof p === 'string' && !/[*:[\]]/.test(p);
    const skipped = paths.filter((p) => !isConcrete(p));
    if (skipped.length) {
        console.warn('[astro] Skipped non-concrete purge target(s) — pass explicit paths for dynamic routes:', skipped);
    }
    const fullUrls = paths
        .filter(isConcrete)
        .map((p) => `https://${host}${p.startsWith('/') ? p : `/${p}`}`);
    if (fullUrls.length === 0)
        return { purged: 0, skipped };
    const endpoint = process.env.IS_MAINLAND === 'true'
        ? 'https://pages-api.cloud.tencent.com/eo/pages/hook/eo_purge'
        : 'https://pages-api.edgeone.ai/eo/pages/hook/eo_purge?site=intl';
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ RequestId: `purge-${Date.now()}`, Token: process.env.PURGE_TOKEN, paths: fullUrls }),
        });
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        }
        catch {
            console.error(`[astro] Purge API non-JSON (${res.status}): ${text.slice(0, 200)}`);
            return { purged: 0, error: 'bad-response' };
        }
        if (data?.error) {
            console.error('[astro] Purge API error:', JSON.stringify(data.error));
            return { purged: 0, error: data.error };
        }
        return { purged: fullUrls.length, urls: fullUrls };
    }
    catch (error) {
        console.error('[astro] Purge request failed:', error?.message || error);
        return { purged: 0, error: String(error?.message || error) };
    }
}
/**
 * Tag a cacheable response with the ISR CDN cache directives if its path
 * matches an ISR route. Mutates response.headers. Skips personalized
 * (Set-Cookie) or explicitly non-shared (no-store/private) responses.
 * (Astro has no separate data-route like __data.json, so pathname is matched directly.)
 */
export function applyIsr(response, pathname, method) {
    if (method !== 'GET' && method !== 'HEAD')
        return response;
    if (!response || response.status !== 200)
        return response;
    if (response.headers.has('set-cookie'))
        return response;
    if (/no-store|private/i.test(response.headers.get('cache-control') || ''))
        return response;
    const route = matchIsrRoute(pathname);
    if (route) {
        const revalidate = typeof route.revalidate === 'number' ? route.revalidate : ISR_SWR_WINDOW;
        try {
            response.headers.set('eo-cdn-cache-control', `s-maxage=${revalidate}, stale-while-revalidate=${ISR_SWR_WINDOW}, durable`);
            if (!response.headers.has('cache-control')) {
                response.headers.set('cache-control', 'public, max-age=0, must-revalidate');
            }
            if (route.tags.length > 0)
                response.headers.set('cache-tag', route.tags.join(','));
        }
        catch {
            // headers immutable — ISR simply won't apply
        }
    }
    return response;
}
/**
 * On-demand revalidation endpoint handler. POST /__edgeone_revalidate
 * Body: { token?, tags?: string[], paths?: string[] }
 */
export async function handleRevalidate(req, bodyBuffer) {
    const token = process.env.PURGE_TOKEN;
    // Secure by default: without a configured token the endpoint is disabled.
    if (!token) {
        return new Response(JSON.stringify({ revalidated: false, error: 'purge-not-configured' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    let payload = {};
    try {
        payload = bodyBuffer ? JSON.parse(bodyBuffer.toString()) : {};
    }
    catch {
        // ignore
    }
    const provided = payload.token || req?.headers?.['x-revalidate-token'];
    if (provided !== token) {
        return new Response(JSON.stringify({ revalidated: false, error: 'invalid-token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const tags = Array.isArray(payload.tags) ? payload.tags : [];
    const explicitPaths = Array.isArray(payload.paths) ? payload.paths : [];
    const paths = Array.from(new Set([...expandTagsToPaths(tags), ...explicitPaths]));
    const result = await purgeEdgeCache(paths, getRealHost(req));
    return new Response(JSON.stringify({ revalidated: !result.error, ...result }), {
        status: result.error ? 500 : 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=isr-runtime.js.map