import type { APIRoute } from "astro";

export const prerender = false;

// 拷贝漫画详情代理：网页版没有开放的详情 JSON 接口（/api/v3/comic 已废弃），
// 详情页是服务端渲染的 HTML，这里抓取后用正则提取可用字段：
// - <title> 里的「第N話」作为总话数（最后更新话数，可能与实际总话数有出入，用户可改）
// - 「最後更新」日期 → 年份
// - 「狀態」→ 已完結 / 連載中
// GET /api/copymanga/detail?id=guimiezhiren（也接受 cm-guimiezhiren）
const PAGE_HOSTS = ["https://www.mangacopy.com", "https://www.copymanga.site"];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

function pick(re: RegExp, text: string): string {
  const m = re.exec(text);
  return m ? m[1].trim() : "";
}

export const GET: APIRoute = async ({ url }) => {
  const raw = (url.searchParams.get("id") || "").trim();
  const pathWord = raw.replace(/^cm-/, "");
  if (!pathWord || !/^[\w-]+$/.test(pathWord)) {
    return new Response(JSON.stringify({ error: "无效的漫画 id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let lastError = "";
  for (const host of PAGE_HOSTS) {
    try {
      const res = await fetch(`${host}/comic/${pathWord}`, { headers: HEADERS });
      if (!res.ok) {
        lastError = `${host} 返回 ${res.status}`;
        continue;
      }
      const html = await res.text();

      const titleText = pick(/<title>([\s\S]*?)<\/title>/i, html);
      // 标题格式：鬼滅之刃-鬼滅之刃漫畫-第206話特別短篇-已完結-...
      const lastChapter = pick(/第\s*(\d+)\s*話/, titleText);
      const lastUpdate = pick(
        /最後更新：<\/span>\s*<span[^>]*>([^<]+)<\/span>/,
        html,
      );
      const status = pick(/狀態：<\/span>\s*<span[^>]*>([^<]+)<\/span>/, html);

      const result = {
        totalEpisodes: lastChapter ? parseInt(lastChapter, 10) : 0,
        year: lastUpdate ? parseInt(lastUpdate.substring(0, 4), 10) || 0 : 0,
        finished: status.includes("完結"),
        statusText: status,
      };
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  return new Response(JSON.stringify({ error: `拷贝漫画详情获取失败: ${lastError}` }), {
    status: 502,
    headers: { "Content-Type": "application/json" },
  });
};
