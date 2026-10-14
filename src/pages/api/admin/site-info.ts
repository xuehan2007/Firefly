import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";

export const prerender = false;

// GET /api/admin/site-info?url=https://example.com
// 抓取目标网站的标题和图标，用于书签管理自动填充
export const GET: APIRoute = async ({ request, url }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) {
		return new Response(JSON.stringify({ error: "未授权" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const raw = (url.searchParams.get("url") || "").trim();
	if (!raw) {
		return new Response(JSON.stringify({ error: "缺少 url 参数" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	let parsed: URL;
	try {
		parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
	} catch {
		return new Response(JSON.stringify({ error: "无效的 URL" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 8000);

	try {
		const res = await fetch(parsed.toString(), {
			signal: controller.signal,
			redirect: "follow",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
				Accept: "text/html,application/xhtml+xml",
			},
		});
		// 只读前 200KB，标题和图标都在 <head> 里
		const html = (await res.text()).slice(0, 200 * 1024);

		// 提取标题：优先 <title>，其次 og:title / og:site_name
		let title = "";
		const mt = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
		if (mt) title = mt[1];
		if (!title) {
			const og =
				html.match(
					/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
				) ||
				html.match(
					/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
				) ||
				html.match(
					/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
				);
			if (og) title = og[1];
		}
		title = decodeEntities(title).replace(/\s+/g, " ").trim().slice(0, 100);

		// 提取图标：apple-touch-icon 优先于普通 icon
		const iconLinks: { rel: string; href: string }[] = [];
		const linkRe = /<link\b[^>]*>/gi;
		let m: RegExpExecArray | null;
		while ((m = linkRe.exec(html)) !== null) {
			const tag = m[0];
			const relM = tag.match(/rel=["']([^"']+)["']/i);
			const hrefM = tag.match(/href=["']([^"']+)["']/i);
			if (relM && hrefM && /icon/i.test(relM[1])) {
				iconLinks.push({ rel: relM[1].toLowerCase(), href: hrefM[1] });
			}
		}
		let icon = "";
		const apple = iconLinks.find((l) => l.rel.includes("apple-touch-icon"));
		const shortcut = iconLinks.find((l) => /(^|\s)(shortcut\s)?icon/.test(l.rel));
		const chosen = apple || shortcut || iconLinks[0];
		if (chosen) {
			try {
				icon = new URL(chosen.href, parsed.toString()).toString();
			} catch {
				icon = "";
			}
		}

		return new Response(JSON.stringify({ title, icon }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "private, max-age=300",
			},
		});
	} catch {
		// 抓取失败不视为错误，返回空结果让前端用 favicon 服务兜底
		return new Response(JSON.stringify({ title: "", icon: "" }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} finally {
		clearTimeout(timer);
	}
};

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ");
}
