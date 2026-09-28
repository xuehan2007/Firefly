import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { a as getDynamic, h as upsertDynamic, t as deleteDynamic } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/dynamic/[...filename].ts
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
		const raw = await getDynamic(filename);
		const content = Buffer.from(raw.content, "base64").toString();
		return new Response(JSON.stringify({
			filename,
			sha: raw.sha,
			content
		}), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "获取动态失败" }), {
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
		await upsertDynamic(filename, content, sha);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "更新动态失败" }), {
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
		await deleteDynamic(filename, sha);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "删除动态失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/dynamic/[...filename]@_@ts
var page = () => ____filename__exports;
//#endregion
export { page };
