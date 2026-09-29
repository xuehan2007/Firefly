import type { APIRoute } from "astro";

export const prerender = false;

// Bangumi 搜索代理 API
// 避免浏览器直接调用 Bangumi API 遇到的 CORS 和 User-Agent 限制
// GET /api/bangumi/search?keyword=xxx
export const GET: APIRoute = async ({ url }) => {
  const keyword = url.searchParams.get("keyword") || "";
  const limit = url.searchParams.get("limit") || "10";

  if (!keyword.trim()) {
    return new Response(
      JSON.stringify({ error: "缺少搜索关键词" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 使用 Bangumi v0 搜索 API(POST 请求)
    const apiUrl = "https://api.bgm.tv/v0/search/subjects";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FireflyBlog/1.0 (https://github.com/xuehan2007/Firefly)",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        keyword: keyword,
        filter: { type: [2] }, // type 2 = 动画
        limit: parseInt(limit, 10),
      }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Bangumi API 返回 ${res.status}` }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // 缓存 1 小时
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: `代理请求失败: ${msg}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
