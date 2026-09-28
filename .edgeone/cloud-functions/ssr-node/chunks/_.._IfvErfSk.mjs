import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { c as getSpec, m as updateSpec } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/spec/[...name].ts
var ____name__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	PUT: () => PUT,
	prerender: () => false
});
var FILE_MAP = {
	about: "about.md",
	guestbook: "guestbook.md"
};
function getName(params) {
	const name = params.name;
	if (Array.isArray(name)) return name.join("/");
	if (typeof name === "string") return name;
	return "";
}
var GET = async ({ params, request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) return new Response(JSON.stringify({ error: "未授权" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	const filename = FILE_MAP[getName(params)];
	if (!filename) return new Response(JSON.stringify({ error: "不允许访问的文件" }), {
		status: 403,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const result = await getSpec(filename);
		return new Response(JSON.stringify({
			sha: result.sha,
			content: result.content
		}), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "获取页面失败" }), {
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
	const filename = FILE_MAP[getName(params)];
	if (!filename) return new Response(JSON.stringify({ error: "不允许访问的文件" }), {
		status: 403,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const { content, sha } = await request.json();
		if (!content || !sha) return new Response(JSON.stringify({ error: "缺少参数" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await updateSpec(filename, content, sha);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "保存页面失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/spec/[...name]@_@ts
var page = () => ____name__exports;
//#endregion
export { page };
