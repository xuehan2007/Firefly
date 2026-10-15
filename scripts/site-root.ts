import { existsSync } from "node:fs";

/**
 * 构建产物根目录（所有后处理脚本的统一入口）。
 *
 * - Vercel（构建时 VERCEL=1）：@astrojs/vercel adapter 把最终部署产物写到
 *   .vercel/output/static，dist 只是中间目录。后处理脚本（字体子集化、内联脚本
 *   压缩、资源裁剪、Pagefind）必须作用在部署产物上，否则改动不会随站点上线。
 * - Cloudflare Pages / 本地：静态产物在 dist/client（astro.config.mjs 走 cloudflare adapter）。
 * - 兜底：dist。
 */
export function resolveSiteRoot(): string {
	if (process.env.VERCEL && existsSync(".vercel/output/static")) {
		return ".vercel/output/static";
	}
	return existsSync("dist/client") ? "dist/client" : "dist";
}
