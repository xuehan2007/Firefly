import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { r as verifyToken } from "./admin-auth_DrXf2a59.mjs";
import { i as getDataFile, p as updateDataFile } from "./github-api_DwNp-1TS.mjs";
//#region src/pages/api/admin/data/[...name].ts
var ____name__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	PUT: () => PUT,
	prerender: () => false
});
var FILE_MAP = {
	music: "music.json",
	booknav: "booknav.json",
	gallery: "gallery.json",
	sponsor: "sponsor.json",
	profile: "profile.json",
	announcement: "announcement.json",
	effects: "effects.json",
	friends: "friends.json",
	backgroundWallpaper: "backgroundWallpaper.json",
	sidebar: "sidebar.json",
	navbar: "navbar.json",
	site: "site.json",
	footer: "footer.json",
	search: "search.json",
	font: "font.json",
	coverImage: "coverImage.json",
	license: "license.json",
	pio: "pio.json",
	musicPlayer: "musicPlayer.json"
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
		const result = await getDataFile(filename);
		return new Response(JSON.stringify({
			sha: result.sha,
			data: result.data
		}), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "获取数据失败" }), {
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
		const { data, sha } = await request.json();
		if (!data || !sha) return new Response(JSON.stringify({ error: "缺少参数" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await updateDataFile(filename, data, sha);
		return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "保存数据失败" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/data/[...name]@_@ts
var page = () => ____name__exports;
//#endregion
export { page };
