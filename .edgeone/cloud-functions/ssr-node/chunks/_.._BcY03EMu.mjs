import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { _ as upsertProject, r as deleteProject, s as getProject } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/project/[...filename].ts
var ____filename__exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	PUT: () => PUT,
	prerender: () => false
});
var GET = async ({ params, request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) return new Response(JSON.stringify({ error: "未授权" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const fp = params.filename;
		const filename = decodeURIComponent(Array.isArray(fp) ? fp.join("/") : String(fp || ""));
		const raw = await getProject(filename);
		const content = Buffer.from(raw.content, "base64").toString();
		return new Response(JSON.stringify({
			filename,
			sha: raw.sha,
			content
		}), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "获取项目失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var PUT = async ({ params, request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) return new Response(JSON.stringify({ error: "未授权" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const fp = params.filename;
		const filename = decodeURIComponent(Array.isArray(fp) ? fp.join("/") : String(fp || ""));
		const { content, sha } = await request.json();
		if (!content || !sha) return new Response(JSON.stringify({ error: "缺少参数" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await upsertProject(filename, content, sha);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "更新项目失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var DELETE = async ({ params, request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) return new Response(JSON.stringify({ error: "未授权" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const fp = params.filename;
		const filename = decodeURIComponent(Array.isArray(fp) ? fp.join("/") : String(fp || ""));
		const { sha } = await request.json();
		if (!sha) return new Response(JSON.stringify({ error: "缺少 sha" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await deleteProject(filename, sha);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "删除项目失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/project/[...filename]@_@ts
var page = () => ____filename__exports;
//#endregion
export { page };
