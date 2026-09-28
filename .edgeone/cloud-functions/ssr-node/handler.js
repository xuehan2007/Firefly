
import { REVALIDATE_ENDPOINT, applyIsr, handleRevalidate } from './isr-runtime.js';

async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const bodyBuffer = Buffer.concat(chunks);
        resolve(bodyBuffer.length ? bodyBuffer : undefined);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const handlerPromise = import('./entry.mjs');

// Resolve the real public host. When EdgeOne Pages proxies a request to the
// origin server, req.headers.host is the internal origin domain. The real
// public host is forwarded in eo-pages-host (EdgeOne specific) or
// x-forwarded-host (standard proxy header). Fall back to host, then localhost.
function resolvePublicHost(req) {
  const forwarded =
    req.headers['x-forwarded-host'] ||
    req.headers['eo-pages-host'] ||
    req.headers.host;
  if (!forwarded) {
    return 'localhost';
  }
  // x-forwarded-host may contain a comma-separated list; take the first hop.
  return forwarded.split(',')[0].trim();
}

async function astroHandler (req, res) {
  try {
    const host = resolvePublicHost(req);
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const url = new URL(req.url, proto + '://' + host);

    let bodyBuffer;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      bodyBuffer = await readRequestBody(req);
    }

    // On-demand ISR revalidation endpoint (purges CDN cache).
    if (url.pathname === REVALIDATE_ENDPOINT && req.method === 'POST') {
      return await handleRevalidate(req, bodyBuffer);
    }

    const { default: handler } = await handlerPromise;

    const headers = new Headers(req.headers);
    // Keep the Host header consistent with the resolved public URL so that
    // request.headers.get('host') matches Astro.url.host.
    headers.set('host', host);
    const requestInit = {
      method: req.method,
      headers,
      body: bodyBuffer,
    };

    const request = new Request(url.toString(), requestInit);
    const response = await handler(request);

    // ISR: tag cacheable responses with EdgeOne CDN cache directives.
    return applyIsr(response, url.pathname, req.method);
  } catch (error) {
    console.error('SSR Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<html><body><h1>Error</h1><p>' + error.message + '</p></body></html>');
  }
}

export default astroHandler;
