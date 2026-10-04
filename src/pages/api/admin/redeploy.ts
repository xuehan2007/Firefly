import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";

export const prerender = false;

// 触发 Vercel 重新部署（Deploy Hook）
// 需要在环境变量 VERCEL_DEPLOY_HOOK 中配置 Deploy Hook URL
// （Vercel 项目 → Settings → Git → Deploy Hooks 创建）
export const POST: APIRoute = async ({ request }) => {
	const auth = request.headers.get("authorization");
	if (!verifyToken(auth)) {
		return new Response(JSON.stringify({ error: "未授权" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const hook =
		import.meta.env.VERCEL_DEPLOY_HOOK || process.env.VERCEL_DEPLOY_HOOK || "";
	if (!hook) {
		return new Response(
			JSON.stringify({
				error:
					"未配置 VERCEL_DEPLOY_HOOK 环境变量（Vercel 项目 → Settings → Git → Deploy Hooks 创建后填入）",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		const res = await fetch(hook, { method: "POST" });
		if (!res.ok) {
			throw new Error(`Deploy Hook 返回 HTTP ${res.status}`);
		}
		return new Response(
			JSON.stringify({ ok: true, message: "已触发重新部署，Vercel 正在构建" }),
			{ headers: { "Content-Type": "application/json" } },
		);
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: `触发部署失败: ${e instanceof Error ? e.message : String(e)}`,
			}),
			{ status: 502, headers: { "Content-Type": "application/json" } },
		);
	}
};
