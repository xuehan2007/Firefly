import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { f as parseFrontmatter, o as getPost, u as listPosts } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/stats.ts
var stats_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
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
		let published = 0;
		let drafts = 0;
		let pinned = 0;
		for (const f of mdFiles) try {
			const raw = await getPost(f.name);
			const content = Buffer.from(raw.content, "base64").toString();
			const { data } = parseFrontmatter(content);
			if (data.draft === true) drafts++;
			else published++;
			if (data.pinned === true) pinned++;
		} catch {
			published++;
		}
		const stats = {
			totalPosts: mdFiles.length,
			published,
			drafts,
			pinned
		};
		return new Response(JSON.stringify(stats), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: "获取统计失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/stats@_@ts
var page = () => stats_exports;
//#endregion
export { page };
