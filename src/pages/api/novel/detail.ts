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

// ESJ Zone 有多个镜像域名，按顺序重试
const ESJ_HOSTS = ["https://www.esjzone.one", "https://www.esjzone.cc", "https://www.esjzone.me"];

/** ESJ Zone 书籍页 → 后台小说条目（可选带登录 Cookie，权限与浏览器一致） */
async function fetchEsj(rawUrl: string, cookie: string) {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return json({ error: "链接格式不对" }, 400);
  }
  if (!/(^|\.)esjzone\.(one|cc|me)$/.test(u.hostname)) {
    return json({ error: "只支持 esjzone.one / .cc / .me 的书籍链接" }, 400);
  }
  const mid = /\/detail\/(\d+)/.exec(u.pathname);
  if (!mid) return json({ error: "链接里没找到书籍 ID（应形如 /detail/123.html）" }, 400);

  // 站点对自动访问敏感，镜像域名逐个重试
  let html = "";
  let lastErr = "";
  for (const host of ESJ_HOSTS) {
    try {
      const res = await fetch(`${host}/detail/${mid[1]}.html`, {
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
      // 下架/删除的书，站点返回一段 alert 跳转脚本，先识别出来避免误报“空页面”
      if (/已被下架或刪除|已被下架或删除/.test(html)) {
        return json({ error: "这本书在 ESJ 已被下架或删除，换一本或手动添加" }, 404);
      }
      if (html.length > 500) break;
      lastErr = `${host} 返回空页面`;
    } catch {
      lastErr = `${host} 连不上`;
    }
  }
  if (!html) {
    return json(
      { error: `ESJ 抓取失败（${lastErr || "无响应"}），稍等重试；若书籍需要权限，请先填 Cookie` },
      502,
    );
  }

  // 权限书或反爬会返回登录页/验证页，页面里没有 book-detail 就不是书籍详情
  if (!/book-detail/.test(html)) {
    const blocked = /my\/login|Just a moment|cf-chl|驗證|验证/.test(html);
    return json(
      {
        error: blocked
          ? "ESJ 返回了登录/验证页：请先在下方填登录 Cookie，再点导入"
          : "ESJ 返回的不是书籍页，检查链接是否正确（要 /detail/数字.html），或稍后重试",
      },
      502,
    );
  }

  // meta 的 property/content 顺序不固定，两种都试
  const meta = (name: string) =>
    pick(new RegExp(`<meta[^>]+(?:property|name)="${name}"[^>]+content="([^"]*)"`, "i"), html) ||
    pick(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${name}"`, "i"), html);

  const title =
    stripHtml(pick(/<h2[^>]*>([\s\S]*?)<\/h2>/i, html)) ||
    stripHtml(meta("og:title")).replace(/\s*[-|_]\s*ESJ Zone.*$/i, "") ||
    stripHtml(pick(/<title>([\s\S]*?)<\/title>/i, html).split(" - ")[0]);

  const author = stripHtml(
    pick(/作者[:：]\s*(?:<\/?[^>]+>\s*)*([^<\n]{1,60})/, html),
  );
  if (!title) return json({ error: "没解析到书名，ESJ 页面结构可能变了" }, 502);
  const type = stripHtml(pick(/類型[:：]\s*(?:<[^>]+>)*\s*([^<\n]{1,20})/, html));
  const updateDate = stripHtml(pick(/更新日期[:：]\s*(?:<[^>]+>)*\s*([\d-]{6,12})/, html));
  const statusText = pick(/(連載中|連載|已完結|完結)/, html);

  // 标签：內容標籤 区块里的链接文字
  const tagBlock = pick(/內容標籤([\s\S]{0,2000}?)(?:<h[1-4]|簡介|简介|章節|章节|$)/i, html);
  const tags = [...new Set(
    [...tagBlock.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
      .map((m) => stripHtml(m[1]))
      .filter((t) => t && t.length <= 14),
  )];

  const synopsis =
    stripHtml(pick(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i, html)) ||
    stripHtml(meta("og:description")) ||
    stripHtml(meta("description"));

  // 封面在 product-gallery 里，图床是 masiro.me，没有 og:image
  const coverRaw =
    pick(/<div[^>]*class="[^"]*product-gallery[^"]*"[\s\S]*?<img[^>]+src="([^"]+)"/i, html) ||
    meta("og:image");
  const cover = coverRaw ? new URL(coverRaw, `${ESJ_HOSTS[0]}/`).toString() : "";

  return json({
    id: `esj-${mid[1]}`,
    source: "esj",
    title: title || `ESJ 书籍 ${mid[1]}`,
    titleJp: "",
    cover,
    platform: "ESJ Zone",
    // 按類型猜分类：韓/韩 → 韩轻，原創 → 网文，其余按日轻；导入后可手动改
    category: /韓|韩/.test(type) ? "韩国轻小说" : /原創/.test(type) ? "中国网文" : "日本轻小说",
    score: 3,
    status: "planned",
    progress: 0,
    totalEpisodes: 0,
    unit: "章",
    year: updateDate ? Number.parseInt(updateDate.substring(0, 4), 10) || 0 : 0,
    studio: author,
    tags,
    synopsis,
    review: "",
    reviewDate: "",
    statusText,
    type,
    lastUpdate: updateDate,
  });
}

export const GET: APIRoute = async ({ url, request }) => {
  const source = url.searchParams.get("source") || "";
  try {
    if (source === "bili") {
      const link = url.searchParams.get("url") || "";
      if (!link) return json({ error: "缺少书籍链接" }, 400);
      return await fetchBili(link);
    }
    if (source === "esj") {
      const link = url.searchParams.get("url") || "";
      if (!link) return json({ error: "缺少书籍链接" }, 400);
      // Cookie 由后台页面从浏览器 localStorage 取出，随请求头发送，不落库
      return await fetchEsj(link, request.headers.get("x-esj-cookie") || "");
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
