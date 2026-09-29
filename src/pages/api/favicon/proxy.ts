import type { APIRoute } from "astro";

export const prerender = false;

// Favicon 代理 API
// 避免浏览器直接加载第三方 favicon 时的 referer 泄露和 CORS 问题
// GET /api/favicon/proxy?url=https://example.com
export const GET: APIRoute = async ({ url }) => {
  const targetUrl = url.searchParams.get("url") || "";

  if (!targetUrl.trim()) {
    return new Response(JSON.stringify({ error: "缺少 url 参数" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 从 URL 中提取域名,生成 favicon 服务地址
  let domain = "";
  try {
    domain = new URL(targetUrl).hostname;
  } catch {
    // 如果不是完整 URL,尝试添加 https://
    try {
      domain = new URL("https://" + targetUrl).hostname;
    } catch {
      return new Response(JSON.stringify({ error: "无效的 URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (!domain) {
    return new Response(JSON.stringify({ error: "无法解析域名" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 返回 favicon 服务 URL(前端直接用这个 URL 加载图片)
  const faviconServices = [
    `https://a.favicon.im/${encodeURIComponent(domain)}`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];

  return new Response(
    JSON.stringify({
      domain,
      favicons: faviconServices,
      primary: faviconServices[0],
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // 缓存 1 天
      },
    }
  );
};
