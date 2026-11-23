import type { APIRoute } from "astro";

export const prerender = false;

// 小说搜索代理（目前只接起点数据站「起点图」）
// 哔哩轻小说搜索有验证码，走 detail 接口的链接导入；ESJ 需登录，未接入。
// GET /api/novel/search?source=qidian&keyword=诡秘之主
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface QidianHit {
  id: string;
  title: string;
  cover: string;
  author: string;
  tags: string[];
  statusText: string;
  words: string;
}

function pick(re: RegExp, text: string): string {
  const m = re.exec(text);
  return m ? m[1].trim() : "";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** 解析起点图书名搜索结果页，按条目块逐个提取 */
function parseQidianSearch(html: string): QidianHit[] {
  const blocks = html.split('<div class="well well-sm table-responsive">').slice(1);
  const list: QidianHit[] = [];
  for (const b of blocks) {
    const id = pick(/\/info\/(\d+)/, b);
    if (!id) continue;
    const title =
      decodeEntities(pick(/<h4[^>]*>([\s\S]*?)<\/h4>/i, b).replace(/<[^>]+>/g, "")).trim() ||
      decodeEntities(pick(/<img[^>]+alt="([^"]*)"/i, b));
    if (!title) continue;
    const cover = pick(/<img[^>]+src="(https:\/\/qidian\.qpic\.cn[^"]+)"/i, b).replace(
      /\/\d+$/,
      "/600",
    );
    const author = decodeEntities(pick(/作者：<a[^>]*>([\s\S]*?)<\/a>/i, b).replace(/<[^>]+>/g, ""));
    const tagLine = pick(/标签:([\s\S]*?)<\/td>/i, b).replace(/<[^>]+>/g, "");
    const statusText = pick(/状态:\s*([^\s<]+)/, tagLine);
    const tags = tagLine
      .split("状态:")[0]
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const words = pick(/总字数:\s*([^\s<]+)/, b);
    list.push({ id, title, cover, author, tags, statusText, words });
    if (list.length >= 20) break;
  }
  return list;
}

export const GET: APIRoute = async ({ url }) => {
  const source = url.searchParams.get("source") || "qidian";
  const keyword = (url.searchParams.get("keyword") || "").trim();

  if (source === "bili") {
    return new Response(
      JSON.stringify({ error: "哔哩轻小说搜索需要验证码，请改用「粘贴书籍链接导入」" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (source !== "qidian") {
    return new Response(JSON.stringify({ error: "不支持的搜索源" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!keyword) {
    return new Response(JSON.stringify({ error: "请输入书名" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(
      `https://www.qidiantu.com/bookxyy/${encodeURIComponent(keyword)}`,
      {
        headers: { "User-Agent": UA, Referer: "https://www.qidiantu.com/search.php" },
      },
    );
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `起点图返回 ${res.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    const html = await res.text();
    const hits = parseQidianSearch(html);
    const data = hits.map((h) => ({
      id: `qd-${h.id}`,
      qidianId: h.id,
      source: "qidian",
      title: h.title,
      titleJp: "",
      cover: h.cover,
      platform: "起点中文网",
      category: "中国网文",
      score: 3,
      status: "planned",
      progress: 0,
      totalEpisodes: 0,
      unit: "章",
      year: 0,
      studio: h.author,
      tags: h.tags,
      synopsis: "",
      review: "",
      reviewDate: "",
      statusText: h.statusText,
      words: h.words,
    }));
    return new Response(JSON.stringify({ data }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: `搜索失败: ${msg}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
