import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { g as renderHead, m as renderTemplate, v as createRenderInstruction } from "./jsx-runtime_CfvsD_GM.mjs";
import { t as createComponent } from "./compiler_CyXmzeW_.mjs";
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/pages/dashboard.astro
var dashboard_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Dashboard,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
var $$Dashboard = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>博客管理后台</title>${renderHead($$result)}</head><body><div id="app"><div class="app-loading">正在加载管理后台...</div></div>${renderScript($$result, "D:/MY blog/Firefly/src/pages/dashboard.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "D:/MY blog/Firefly/src/pages/dashboard.astro", void 0);
var $$file = "D:/MY blog/Firefly/src/pages/dashboard.astro";
var $$url = "/dashboard/";
//#endregion
//#region \0virtual:astro:page:src/pages/dashboard@_@astro
var page = () => dashboard_exports;
//#endregion
export { page };
