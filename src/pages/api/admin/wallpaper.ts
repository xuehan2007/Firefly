import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import {
	deleteImage,
	FileExistsError,
	getDataFile,
	updateDataFile,
	uploadRepoFile,
} from "../../../utils/github-api";

export const prerender = false;

type WallpaperKind = "desktop" | "mobile";

// 仓库内目录 / JSON 中引用路径前缀（JSON 路径相对于 src/）
const KIND_CONFIG: Record<WallpaperKind, { repoDir: string; jsonPrefix: string }> = {
	desktop: { repoDir: "src/assets/wallpapers", jsonPrefix: "assets/wallpapers" },
	mobile: {
		repoDir: "src/assets/wallpapers/mobile",
		jsonPrefix: "assets/wallpapers/mobile",
	},
};

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: JSON_HEADERS,
	});
}

// 从 backgroundWallpaper.json 的 src 字段中取某一档位的路径数组（就地规范化为数组）
function normalizeSrcList(data: Record<string, unknown>, kind: WallpaperKind): string[] {
	const d = data as {
		src?: string | string[] | Record<string, string | string[] | undefined>;
	};
	if (d.src == null) {
		d.src = { desktop: [], mobile: [] };
	}
	if (typeof d.src === "string") {
		d.src = { desktop: [d.src], mobile: [] };
	} else if (Array.isArray(d.src)) {
		d.src = { desktop: d.src, mobile: [] };
	}
	const srcObj = d.src as Record<string, string | string[] | undefined>;
	const cur = srcObj[kind];
	const list = Array.isArray(cur) ? cur : cur ? [cur] : [];
	srcObj[kind] = list;
	return list;
}

// 计算下一张壁纸编号：取该档位现有 ba-wallpaper-N.jpg 的最大 N + 1
function nextWallpaperIndex(list: string[]): number {
	let max = 0;
	for (const p of list) {
		const m = /ba-wallpaper-(\d+)\.jpg$/.exec(p);
		if (m) max = Math.max(max, Number.parseInt(m[1], 10));
	}
	return max + 1;
}

// POST /api/admin/wallpaper - 上传壁纸到 src/assets/wallpapers(/mobile) 并注册进轮换池
// body: { kind: "desktop" | "mobile", content: base64 jpeg（前端已压缩缩放） }
export const POST: APIRoute = async ({ request }) => {
	if (!verifyToken(request.headers.get("authorization"))) {
		return jsonError("未授权", 401);
	}

	try {
		const { kind, content } = await request.json();
		if (kind !== "desktop" && kind !== "mobile") {
			return jsonError("kind 必须是 desktop 或 mobile", 400);
		}
		if (!content || typeof content !== "string") {
			return jsonError("缺少图片内容", 400);
		}

		const cfg = KIND_CONFIG[kind as WallpaperKind];

		// 1. 读配置，算起始编号
		const { data: initData } = await getDataFile("backgroundWallpaper.json");
		const initList = normalizeSrcList(
			initData as Record<string, unknown>,
			kind,
		);
		let n = nextWallpaperIndex(initList);

		// 2. 分配空闲文件名并上传。GitHub 读接口可能短暂过期：
		//    编号与刚提交的文件撞上时顺延到下一个，绝不覆盖已有壁纸
		let jsonPath: string | null = null;
		for (let attempt = 0; attempt < 8; attempt++, n++) {
			const filename = `ba-wallpaper-${n}.jpg`;
			try {
				await uploadRepoFile(
					`${cfg.repoDir}/${filename}`,
					content,
					`admin: 上传${kind === "mobile" ? "移动端" : "桌面端"}壁纸 ${filename}`,
					{ overwrite: false },
				);
				jsonPath = `${cfg.jsonPrefix}/${filename}`;
				break;
			} catch (e) {
				if (e instanceof FileExistsError) continue;
				throw e;
			}
		}
		if (!jsonPath) {
			return jsonError("分配文件名失败，请稍后重试", 500);
		}

		// 3. 注册进轮换池（追加到数组末尾）。JSON 的 sha 也可能因过期/并发冲突，
		//    失败后重新拉取最新版本重试
		let registered = false;
		let lastErr: unknown = null;
		for (let i = 0; i < 3 && !registered; i++) {
			if (i > 0) await new Promise((r) => setTimeout(r, 800));
			const { sha, data } = await getDataFile("backgroundWallpaper.json");
			const list = normalizeSrcList(data as Record<string, unknown>, kind);
			if (list.includes(jsonPath)) {
				registered = true; // 已被注册过（重试场景）
				break;
			}
			list.push(jsonPath);
			try {
				await updateDataFile("backgroundWallpaper.json", data, sha);
				registered = true;
			} catch (e) {
				lastErr = e;
			}
		}
		if (!registered) {
			throw lastErr instanceof Error
				? lastErr
				: new Error("注册壁纸到轮换池失败");
		}

		return new Response(JSON.stringify({ success: true, path: jsonPath }), {
			headers: JSON_HEADERS,
		});
	} catch (e) {
		return jsonError(e instanceof Error ? e.message : "上传壁纸失败", 500);
	}
};

// DELETE /api/admin/wallpaper - 从轮换池移除并删除仓库文件
// body: { kind: "desktop" | "mobile", path: "assets/wallpapers/..." }
export const DELETE: APIRoute = async ({ request }) => {
	if (!verifyToken(request.headers.get("authorization"))) {
		return jsonError("未授权", 401);
	}

	try {
		const { kind, path } = await request.json();
		if (kind !== "desktop" && kind !== "mobile") {
			return jsonError("kind 必须是 desktop 或 mobile", 400);
		}
		const cfg = KIND_CONFIG[kind as WallpaperKind];
		// 只允许删除本档位目录内的壁纸文件，防止越权删仓库其他文件
		if (
			typeof path !== "string" ||
			!path.startsWith(`${cfg.jsonPrefix}/`) ||
			path.includes("..")
		) {
			return jsonError("不允许删除的路径", 403);
		}

		// 1. 先从轮换池移除（先改 JSON，文件删失败也只是留个孤儿文件，不会 404）
		const { sha, data } = await getDataFile("backgroundWallpaper.json");
		const list = normalizeSrcList(data as Record<string, unknown>, kind);
		const idx = list.indexOf(path);
		if (idx === -1) {
			return jsonError("该壁纸不在轮换池中", 404);
		}
		list.splice(idx, 1);

		// 顺带从禁用列表里清掉，保持 JSON 干净
		const dd = data as { disabled?: Record<string, string[] | undefined> };
		const disList = dd.disabled?.[kind];
		if (Array.isArray(disList)) {
			const di = disList.indexOf(path);
			if (di !== -1) disList.splice(di, 1);
		}

		await updateDataFile("backgroundWallpaper.json", data, sha);

		// 2. 删除仓库中的图片文件
		await deleteImage(`src/${path}`);

		return new Response(JSON.stringify({ success: true }), {
			headers: JSON_HEADERS,
		});
	} catch (e) {
		return jsonError(e instanceof Error ? e.message : "删除壁纸失败", 500);
	}
};
