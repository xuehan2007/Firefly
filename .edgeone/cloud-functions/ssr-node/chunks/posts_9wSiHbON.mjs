import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { f as parseFrontmatter, g as upsertPost, o as getPost, u as listPosts } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/posts.ts
var posts_exports = /* @__PURE__ */ __exportAll({
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
		const mdFiles = (await listPosts()).filter((f) => f.name.endsWith(".md"));
		const posts = [];
		for (const f of mdFiles) try {
			const raw = await getPost(f.name);
			const content = Buffer.from(raw.content, "base64").toString();
			const { data } = parseFrontmatter(content);
			posts.push({
				filename: f.name,
				sha: raw.sha,
				title: data.title || f.name,
				published: data.published || null,
				category: data.category || "",
				tags: data.tags || [],
				draft: data.draft === true,
				pinned: data.pinned === true
			});
		} catch {
			posts.push({
				filename: f.name,
				sha: f.sha,
				title: f.name
			});
		}
		posts.sort((a, b) => {
			const ta = a.published ? new Date(a.published).getTime() : 0;
			return (b.published ? new Date(b.published).getTime() : 0) - ta;
		});
		return new Response(JSON.stringify(posts), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: "获取文章列表失败" }), {
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
		await upsertPost(filename, content);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "创建文章失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/posts@_@ts
var page = () => posts_exports;
//#endregion
export { page };
