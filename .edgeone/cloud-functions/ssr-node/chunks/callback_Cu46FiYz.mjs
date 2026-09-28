import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/callback.ts
var callback_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url }) => {
	if (!url.searchParams.get("code")) return new Response("缺少授权码 code", { status: 400 });
	return new Response("OAuth 配置缺失，请设置 OAUTH_CLIENT_ID 和 OAUTH_CLIENT_SECRET", { status: 500 });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/callback@_@ts
var page = () => callback_exports;
//#endregion
export { page };
