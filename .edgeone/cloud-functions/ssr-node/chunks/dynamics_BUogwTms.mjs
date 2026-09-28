import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { a as getDynamic, f as parseFrontmatter, h as upsertDynamic, l as listDynamics } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/dynamics.ts
var dynamics_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async ({ request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) return new Response(JSON.stringify({ error: "未授权" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const files = await listDynamics();
		const dynamics = [];
		for (const f of files) try {
			const raw = await getDynamic(f.name);
			const content = Buffer.from(raw.content, "base64").toString();
			const { data, body } = parseFrontmatter(content);
			dynamics.push({
				filename: f.name,
				sha: raw.sha,
				published: data.published || null,
				preview: body.replace(/!\[.*?\]\(.*?\)/g, "[图片]").replace(/\n/g, " ").slice(0, 60)
			});
		} catch {
			dynamics.push({
				filename: f.name,
				sha: f.sha,
				published: null,
				preview: ""
			});
		}
		dynamics.sort((a, b) => {
			const ta = a.published ? new Date(a.published).getTime() : 0;
			return (b.published ? new Date(b.published).getTime() : 0) - ta;
		});
		return new Response(JSON.stringify(dynamics), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: "获取动态列表失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var POST = async ({ request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) return new Response(JSON.stringify({ error: "未授权" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const { filename, content } = await request.json();
		if (!filename || !content) return new Response(JSON.stringify({ error: "缺少参数" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await upsertDynamic(filename, content);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "创建动态失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/dynamics@_@ts
var page = () => dynamics_exports;
//#endregion
export { page };
