import type { APIRoute } from "astro";

export const prerender = false;

// 拷贝漫画搜索代理 API
// 拷贝漫画网页版搜索接口（主站 /search 页面实际调用的就是 searchcl/comics；
// 旧的 /api/v3/search/comic 已废弃，返回空 list）。
// 由服务端转发，避免浏览器 CORS 及 Referer 限制。
// GET /api/copymanga/search?keyword=xxx&limit=20
const API_HOSTS = ["https://api.mangacopy.com", "https://api.copymanga.site"];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Referer: "https://www.mangacopy.com/",
  Accept: "application/json",
};

export const GET: APIRoute = async ({ url }) => {
  const keyword = (url.searchParams.get("keyword") || "").trim();
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 50);

  if (!keyword) {
    return new Response(JSON.stringify({ error: "缺少搜索关键词" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const qs = `offset=0&platform=2&limit=${limit}&q=${encodeURIComponent(keyword)}&q_type=`;
  let lastError = "";

  // 主域名失败时自动换备用域名（拷贝漫画经常更换可用域名）
  for (const host of API_HOSTS) {
    try {
      const res = await fetch(`${host}/api/kb/web/searchcl/comics?${qs}`, { headers: HEADERS });
      if (!res.ok) {
        lastError = `${host} 返回 ${res.status}`;
        continue;
      }
      const data = await res.json();
      if (data && data.code === 200 && data.results) {
        return new Response(JSON.stringify({ data: data.results.list || [], total: data.results.total || 0 }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
      lastError = (data && data.message) || "返回结构异常";
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  return new Response(JSON.stringify({ error: `拷贝漫画搜索失败: ${lastError}` }), {
    status: 502,
    headers: { "Content-Type": "application/json" },
  });
};
