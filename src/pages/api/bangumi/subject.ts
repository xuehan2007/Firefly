import type { APIRoute } from "astro";

export const prerender = false;

// Bangumi 单条目详情代理
// 导入漫画时用来自动补全搜索接口拿不到的「册数 / 作者 / 出版社」
// GET /api/bangumi/subject?id=26
export const GET: APIRoute = async ({ url }) => {
	const id = url.searchParams.get("id") || "";
	// 只允许纯数字 id，避免拼出任意路径
	if (!/^\d{1,9}$/.test(id)) {
		return new Response(JSON.stringify({ error: "缺少合法的条目 id" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const res = await fetch(`https://api.bgm.tv/v0/subjects/${id}`, {
			headers: {
				"User-Agent": "FireflyBlog/1.0 (https://github.com/xuehan2007/Firefly)",
				Accept: "application/json",
			},
		});

		if (!res.ok) {
			return new Response(
				JSON.stringify({ error: `Bangumi API 返回 ${res.status}` }),
				{ status: res.status, headers: { "Content-Type": "application/json" } },
			);
		}

		const data = await res.json();
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=86400", // 条目详情变动极少，缓存 1 天
			},
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return new Response(
			JSON.stringify({ error: `代理请求失败: ${msg}` }),
			{ status: 502, headers: { "Content-Type": "application/json" } },
		);
	}
};
