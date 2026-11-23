import type { APIRoute } from "astro";

export const prerender = false;

// 小说详情补全
// - source=bili&url=https://www.linovelib.com/novel/1.html
//   哔哩轻小说没有可用搜索接口（搜索要验证码），改为粘贴书籍链接抓详情页
// - source=qidian&id=1010868264
//   起点图（qidiantu.com）书籍详情，用于补全简介/作者/标签
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

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

/** 去标签：<br>/</p> 转换行，其余标签删掉 */
function stripHtml(s: string): string {
  return decodeEntities(
    s
      .replace(/\r\n?/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** 哔哩轻小说书籍页 → 后台小说条目 */
async function fetchBili(rawUrl: string) {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return json({ error: "链接格式不对" }, 400);
  }
  if (!/(^|\.)linovelib\.com$/.test(u.hostname)) {
    return json({ error: "只支持 www.linovelib.com 的书籍链接" }, 400);
  }
  const mid = /\/novel\/(\d+)/.exec(u.pathname);
  if (!mid) return json({ error: "链接里没找到书籍 ID（应形如 /novel/123.html）" }, 400);

  const res = await fetch(`https://www.linovelib.com/novel/${mid[1]}.html`, {
    headers: { "User-Agent": UA, Referer: "https://www.linovelib.com/" },
  });
  if (!res.ok) return json({ error: `哔哩轻小说返回 ${res.status}` }, 502);
  const html = await res.text();

  const title = stripHtml(pick(/<h1[^>]*class="[^"]*book-name[^"]*"[^>]*>([\s\S]*?)<\/h1>/i, html));
  if (!title) return json({ error: "页面里没找到书名，可能被反爬拦了" }, 502);

  const alias = stripHtml(pick(/<span[^>]*class="[^"]*bkname-body[^"]*"[^>]*>([\s\S]*?)<\/span>/i, html));
  const author =
    stripHtml(
      pick(/<meta[^>]+property="og:novel:author"[^>]+content="([^"]+)"/i, html),
    ) ||
    stripHtml(
      pick(/<div[^>]*class="[^"]*au-name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i, html).replace(/<[^>]+>/g, ""),
    );
  const statusText = stripHtml(pick(/<a[^>]*class="[^"]*state[^"]*"[^>]*>([\s\S]*?)<\/a>/i, html));

  // book-label 里除状态外的链接文字都是分类/标签
  const labelBlock = pick(/<div[^>]*class="[^"]*book-label[^"]*"[^>]*>([\s\S]*?)<\/div>/i, html);
  const tags = [...labelBlock.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter((t) => t && !/^(完结|連載|连载|已完结)$/.test(t));

  // 简介：book-dec 里第一个段落（别名段之前）
  const decBlock = pick(/<div[^>]*class="[^"]*book-dec[^"]*"[^>]*>([\s\S]*?)<p[^>]*class="[^"]*backupname/i, html)
    || pick(/<div[^>]*class="[^"]*book-dec[^"]*"[^>]*>([\s\S]*?)<\/div>/i, html);
  const synopsis = stripHtml(decBlock);

  // 字数/章节数：au-words 里两个 <i>
  const iTags = [...pick(/<div[^>]*class="[^"]*au-words[^"]*"[^>]*>([\s\S]*?)<\/div>/i, html).matchAll(/<i[^>]*>([\s\S]*?)<\/i>/gi)]
    .map((m) => stripHtml(m[1]));
  const chapters = Number.parseInt(iTags[1] || "", 10) || 0;

  // 哔哩轻小说只有 s.jpg 这一档缩略图可用，原图 404，直接用它
  const cover = pick(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i, html);
  const lastUpdate = pick(/最后更新：\s*([\d-]{8,10})/, html);
  const year = lastUpdate ? Number.parseInt(lastUpdate.substring(0, 4), 10) || 0 : 0;

  return json({
    id: `bili-${mid[1]}`,
    source: "bili",
    title,
    titleJp: alias,
    cover,
    platform: "哔哩轻小说",
    category: "日本轻小说",
    score: 3,
    status: "planned",
    progress: 0,
    totalEpisodes: chapters,
    unit: "章",
    year,
    studio: author,
    tags,
    synopsis,
    review: "",
    reviewDate: "",
    statusText,
    finished: statusText.includes("完"),
    lastUpdate,
  });
}

/** 起点图书籍详情 → 补全字段 */
async function fetchQidian(id: string) {
  if (!/^\d{1,12}$/.test(id)) return json({ error: "条目 id 不合法" }, 400);
  const res = await fetch(`https://www.qidiantu.com/info/${id}`, {
    headers: { "User-Agent": UA, Referer: "https://www.qidiantu.com/" },
  });
  if (!res.ok) return json({ error: `起点图返回 ${res.status}` }, 502);
  const html = await res.text();

  const title = stripHtml(pick(/<h1[^>]*class="[^"]*h1-table[^"]*"[^>]*>([\s\S]*?)<\/h1>/i, html));
  const author = stripHtml(pick(/作者：<a[^>]*>([\s\S]*?)<\/a>/i, html));
  const tagLine = pick(/标签:([\s\S]*?)<\/td>/i, html).replace(/<[^>]+>/g, "");
  const statusText = pick(/状态:\s*([^\s<]+)/, tagLine);
  const tags = tagLine.split("状态:")[0].trim().split(/\s+/).filter(Boolean);
  const words = pick(/总字数:\s*([^\s<]+)/, html);

  // 简介在第一个 panel-body 里，取到「展开更多简介」按钮之前
  const panel = pick(/<div[^>]*class="[^"]*panel-body[^"]*"[^>]*>([\s\S]*?)<a[^>]+href="#demo"/i, html)
    || pick(/<div[^>]*class="[^"]*panel-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i, html);
  const synopsis = stripHtml(panel);

  return json({ title, studio: author, tags, statusText, words, synopsis });
}

export const GET: APIRoute = async ({ url }) => {
  const source = url.searchParams.get("source") || "";
  try {
    if (source === "bili") {
      const link = url.searchParams.get("url") || "";
      if (!link) return json({ error: "缺少书籍链接" }, 400);
      return await fetchBili(link);
    }
    if (source === "qidian") {
      const id = (url.searchParams.get("id") || "").replace(/^qd-/, "");
      if (!id) return json({ error: "缺少条目 id" }, 400);
      return await fetchQidian(id);
    }
    return json({ error: "不支持的数据源" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: `抓取失败: ${msg}` }, 502);
  }
};
