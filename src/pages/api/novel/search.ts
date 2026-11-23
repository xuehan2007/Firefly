import type { APIRoute } from "astro";
import { fetchQQSearch, qqCoverUrl, type QQNovelHit } from "../../../utils/qq-novel";

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

/** ESJ 书名常带 [完结]/[連載] 这类状态前缀，导入时去掉（状态另存 statusText） */
function cleanNovelTitle(raw: string): string {
  const re =
    /^[\[【(（]\s*(?:已?完[结結]|連載中?|连载中?|完本|全本|短篇|長篇|长篇|新書|新书)\s*[\]】)）]\s*/;
  let t = raw.trim();
  let prev = "";
  while (prev !== t) {
    prev = t;
    t = t.replace(re, "").trim();
  }
  return t;
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

// ESJ Zone 没有书名搜索接口，只能按分类列表浏览（页面分页形如 /list-11/2.html）
const ESJ_HOSTS = ["https://www.esjzone.one", "https://www.esjzone.cc", "https://www.esjzone.me"];
const ESJ_CATEGORY: Record<string, { path: string; label: string }> = {
  all: { path: "01", label: "全部轻小说" },
  original: { path: "21", label: "中国网文" },
  japanese: { path: "11", label: "日本轻小说" },
  korean: { path: "31", label: "韩国轻小说" },
};

/** ESJ 分类列表页 → 条目数组（封面在 lazyload 的 data-src 上） */
function parseEsjList(html: string, categoryLabel: string) {
  const blocks = html.split('<div class="card mb-30"').slice(1);
  const list = [];
  for (const b of blocks) {
    const id = pick(/href="\/detail\/(\d+)\.html"/, b);
    const title = cleanNovelTitle(
      decodeEntities(pick(/title="([^"]*)"/, b) || pick(/<h5[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/, b)),
    );
    if (!id || !title) continue;
    const cover = pick(/data-src="([^"]+)"/, b);
    const author = decodeEntities(
      pick(/<div class="card-author">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/, b).replace(/<[^>]+>/g, "").trim(),
    );
    list.push({
      id: `esj-${id}`,
      esjId: id,
      source: "esj",
      title: title.trim(),
      titleJp: "",
      cover,
      platform: "ESJ Zone",
      category: categoryLabel,
      score: 3,
      status: "planned",
      progress: 0,
      totalEpisodes: 0,
      unit: "章",
      year: 0,
      studio: author,
      tags: [],
      synopsis: "",
      review: "",
      reviewDate: "",
      detailUrl: `https://www.esjzone.one/detail/${id}.html`,
    });
    if (list.length >= 40) break;
  }
  return list;
}

async function fetchEsjList(category: string, page: number, cookie: string, tag = "") {
  const meta = ESJ_CATEGORY[category] || ESJ_CATEGORY.all;
  const p = Math.max(1, Math.min(300, Math.floor(page) || 1));
  // 有 tag 时走作者/标签页（ESJ 的作者就是标签），否则走分类列表
  const path = tag
    ? `/tags/${encodeURIComponent(tag)}/${p}.html`
    : `/list-${meta.path}/${p}.html`;
  let html = "";
  let lastErr = "";
  for (const host of ESJ_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, {
        headers: {
          "User-Agent": UA,
          Referer: `${host}/`,
          Accept: "text/html,application/xhtml+xml",
          ...(cookie ? { Cookie: cookie } : {}),
        },
      });
      if (!res.ok) {
        lastErr = `${host} 返回 ${res.status}`;
        continue;
      }
      html = await res.text();
      if (html.length > 1000) break;
      lastErr = `${host} 返回空页面`;
    } catch {
      lastErr = `${host} 连不上`;
    }
  }
  if (!html) throw new Error(`ESJ 抓取失败（${lastErr || "无响应"}）`);
  const totalPages = Number.parseInt(pick(/total:\s*(\d+)/, html), 10) || 0;
  const data = parseEsjList(html, tag ? `作者：${tag}` : meta.label);
  return { data, totalPages, page: p, category, tag };
}

/** QQ阅读搜索结果 → 后台小说条目（搜索页已带简介/作者/分类/字数，导入无需再抓详情） */
function mapQQHit(h: QQNovelHit) {
  const words = h.totalWords >= 10000 ? `${Math.round(h.totalWords / 10000)}万` : String(h.totalWords || "");
  return {
    id: `qq-${h.bid}`,
    qqBid: h.bid,
    source: "qq",
    title: h.title,
    titleJp: "",
    cover: qqCoverUrl(h.bid),
    platform: "QQ阅读",
    category: "中国网文",
    score: 3,
    status: "planned",
    progress: 0,
    totalEpisodes: 0,
    unit: "章",
    year: 0,
    studio: h.author,
    tags: h.category ? [h.category] : [],
    synopsis: h.intro,
    review: "",
    reviewDate: "",
    statusText: h.finished ? "已完结" : "连载中",
    words,
  };
}

export const GET: APIRoute = async ({ url, request }) => {
  const source = url.searchParams.get("source") || "qidian";
  const keyword = (url.searchParams.get("keyword") || "").trim();

  if (source === "bili") {
    return new Response(
      JSON.stringify({ error: "哔哩轻小说搜索需要验证码，请改用「粘贴书籍链接导入」" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (source === "esj") {
    try {
      const result = await fetchEsjList(
        url.searchParams.get("category") || "all",
        Number.parseInt(url.searchParams.get("page") || "1", 10) || 1,
        request.headers.get("x-esj-cookie") || "",
        (url.searchParams.get("tag") || "").trim(),
      );
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  if (source === "qq") {
    if (!keyword) {
      return new Response(JSON.stringify({ error: "请输入书名" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    try {
      const hits = await fetchQQSearch(keyword);
      return new Response(JSON.stringify({ data: hits.map(mapQQHit) }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ error: `QQ阅读搜索失败: ${msg}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
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
