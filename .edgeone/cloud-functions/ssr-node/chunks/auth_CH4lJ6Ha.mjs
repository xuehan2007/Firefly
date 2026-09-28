import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/auth.ts
var auth_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = ({ url }) => {
	return new Response("OAUTH_CLIENT_ID 未配置，请在部署平台设置环境变量", { status: 500 });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth@_@ts
var page = () => auth_exports;
//#endregion
export { page };
