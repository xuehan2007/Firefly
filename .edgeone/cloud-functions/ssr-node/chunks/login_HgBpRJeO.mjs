import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as verifyPassword, t as generateToken } from "./admin-auth_DrXf2a59.mjs";
//#region src/pages/api/admin/login.ts
var login_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const { password } = await request.json();
		if (!verifyPassword(password)) return new Response(JSON.stringify({ error: "密码错误" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		const token = generateToken();
		return new Response(JSON.stringify({ token }), { headers: { "Content-Type": "application/json" } });
	} catch (e) {
		return new Response(JSON.stringify({ error: "请求失败" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/login@_@ts
var page = () => login_exports;
//#endregion
export { page };
