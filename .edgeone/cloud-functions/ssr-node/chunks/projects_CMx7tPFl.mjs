import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { _ as upsertProject, d as listProjects, f as parseFrontmatter, s as getProject } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/projects.ts
var projects_exports = /* @__PURE__ */ __exportAll({
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
		const files = await listProjects();
		const projects = [];
		for (const f of files) try {
			const raw = await getProject(f.name);
			const content = Buffer.from(raw.content, "base64").toString();
			const { data } = parseFrontmatter(content);
			projects.push({
				filename: f.name,
				sha: raw.sha,
				title: data.title || f.name,
				published: data.published || null,
				status: data.status || "",
				description: data.description || "",
				draft: data.draft === true
			});
		} catch {
			projects.push({
				filename: f.name,
				sha: f.sha,
				title: f.name
			});
		}
		projects.sort((a, b) => {
			const ta = a.published ? new Date(a.published).getTime() : 0;
			return (b.published ? new Date(b.published).getTime() : 0) - ta;
		});
		return new Response(JSON.stringify(projects), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: "获取项目列表失败" }), {
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
		await upsertProject(filename, content);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "创建项目失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/projects@_@ts
var page = () => projects_exports;
//#endregion
export { page };
