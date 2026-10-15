import type { APIRoute } from "astro";

export const prerender = false;

// 图片代理 API
// 解决第三方图床(如番剧封面 lain.bgm.tv)在国内手机直连不稳定、加载失败的问题:
// 由服务端(Cloudflare 边缘)抓取图片后再以本站同源地址返回,手机访问本站即可拿到图。
// 如以后需要代理其他图床,在 ALLOWED_HOSTS 里追加域名后缀即可。
// GET /api/img/proxy?url=https://lain.bgm.tv/pic/cover/l/40/cc/486039_0S1ar.jpg
// 可选 &w=400:让 Bangumi 图床返回该宽度的缩略图,避免手机下载原图
const ALLOWED_HOSTS = ["bgm.tv", "lain.bgm.tv"];

function isAllowedHost(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOWED_HOSTS.some((suffix) => h === suffix || h.endsWith(`.${suffix}`));
}

// Bangumi 图床支持在 /pic/ 前插入 /r/{宽}/ 取指定尺寸(如 /r/400/pic/cover/l/...)
// 已经带 /r/ 的地址不重复拼接
function upstreamUrl(parsed: URL, width: number): string {
  const canResize =
    width > 0 && /^\/pic\//.test(parsed.pathname) && !/^\/r\/\d+\//.test(parsed.pathname);
  return canResize
    ? `${parsed.origin}/r/${width}${parsed.pathname}${parsed.search}`
    : parsed.toString();
}

export const GET: APIRoute = async ({ url }) => {
  const target = url.searchParams.get("url") || "";

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("无效的 url 参数", { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new Response("仅支持 http(s) 图片地址", { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return new Response("不允许代理该图片域名", { status: 403 });
  }

  const wParam = url.searchParams.get("w") || "";
  const width = /^\d{2,4}$/.test(wParam) ? Number(wParam) : 0;

  try {
    const upstream = await fetch(upstreamUrl(parsed, width), {
      headers: {
        "User-Agent":
          "FireflyBlog/1.0 (+https://github.com/xuehan2007/Firefly)",
        Referer: "https://bgm.tv/",
        Accept: "image/avif,image/webp,image/jpeg,image/png,image/*,*/*",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("上游图片获取失败", { status: 502 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return new Response("上游图片获取异常", { status: 502 });
  }
};
