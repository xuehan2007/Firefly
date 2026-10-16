import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import {
	BRANCH,
	FileExistsError,
	REPO,
	deleteImage,
	getDataFile,
	listRepoDir,
	uploadRepoFile,
} from "../../../utils/github-api";

export const prerender = false;

const GALLERY_ROOT = "public/gallery";
const JSON_HEADERS = { "Content-Type": "application/json" };
// 相册 id 只允许字母数字下划线短横线，避免拼出越权路径
const ALBUM_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|avif|gif)$/i;

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: JSON_HEADERS,
	});
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: JSON_HEADERS,
	});
}

function isGif(name: string): boolean {
	return /\.gif$/i.test(name);
}

/** public/gallery/<album> 目录在仓库里的路径 */
function albumDirOf(album: string): string {
	return `${GALLERY_ROOT}/${album}`;
}

/** public/gallery/<album>/<file> 在仓库里的完整路径 */
function repoPathOf(album: string, name: string): string {
	return `${albumDirOf(album)}/${name}`;
}

/** 未部署前也能看的即时预览地址（跟着 master 分支走） */
function rawUrlOf(repoPath: string): string {
	return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${repoPath}`;
}

/** 生成不容易撞车的文件名，保留原扩展名 */
function makeFileName(original: string): string {
	const ext = (IMAGE_EXT_RE.exec(original)?.[0] || ".jpg").toLowerCase();
	const stamp = new Date()
		.toISOString()
		.replace(/[-:T]/g, "")
		.slice(0, 14);
	const rand = Math.random().toString(36).slice(2, 8);
	return `${stamp}-${rand}${ext}`;
}

// GET /api/admin/gallery              列出所有相册的照片数与封面（扫描仓库文件树）
// GET /api/admin/gallery?album=<id>   列出该相册下的照片明细
export const GET: APIRoute = async ({ request }) => {
	if (!verifyToken(request.headers.get("authorization"))) {
		return jsonError("未授权", 401);
	}

	const album = new URL(request.url).searchParams.get("album");

	try {
		if (album) {
			if (!ALBUM_ID_RE.test(album)) return jsonError("相册 ID 不合法", 400);
			const files = (await listRepoDir(albumDirOf(album)))
				.filter((f) => IMAGE_EXT_RE.test(f.name))
				.sort((a, b) => a.name.localeCompare(b.name));
			return json({
				album,
				photos: files.map((f) => ({
					name: f.name,
					path: f.path,
					sha: f.sha,
					size: f.size ?? 0,
					isGif: isGif(f.name),
					isCover: /^cover\./i.test(f.name),
					rawUrl: rawUrlOf(f.path),
					localUrl: `/gallery/${album}/${f.name}`,
				})),
			});
		}

		// 汇总模式：按 data/gallery.json 里的相册逐个列目录
		// （原来递归整仓 tree 又多又慢，相册数量少时逐个 Contents 请求更稳）
		const { data } = await getDataFile("gallery.json");
		const albumList = Array.isArray(data) ? (data as { id?: unknown }[]) : [];
		const albums: Record<
			string,
			{ count: number; cover: string | null; coverRawUrl: string | null }
		> = {};

		await Promise.all(
			albumList.map(async (alb) => {
				const id = typeof alb?.id === "string" ? alb.id : "";
				if (!ALBUM_ID_RE.test(id)) return;
				const files = (await listRepoDir(albumDirOf(id)))
					.filter((f) => IMAGE_EXT_RE.test(f.name))
					.sort((a, b) => a.name.localeCompare(b.name));
				// cover.* 文件优先当封面，否则用目录里的第一张
				const coverFile =
					files.find((f) => /^cover\./i.test(f.name)) ?? files[0];
				albums[id] = {
					count: files.length,
					cover: coverFile ? coverFile.name : null,
					coverRawUrl: coverFile ? rawUrlOf(coverFile.path) : null,
				};
			}),
		);

		return json({ albums });
	} catch (e) {
		return jsonError(e instanceof Error ? e.message : "读取相册失败", 500);
	}
};

// POST /api/admin/gallery - multipart 上传单张照片（前端已按需压缩）
// form-data: album=<id>&file=<图片>
export const POST: APIRoute = async ({ request }) => {
	if (!verifyToken(request.headers.get("authorization"))) {
		return jsonError("未授权", 401);
	}

	try {
		const form = await request.formData();
		const album = String(form.get("album") || "");
		const file = form.get("file");
		if (!ALBUM_ID_RE.test(album)) return jsonError("相册 ID 不合法", 400);
		if (!(file instanceof File)) return jsonError("缺少图片文件", 400);
		if (!IMAGE_EXT_RE.test(file.name)) {
			return jsonError("只支持 jpg/png/webp/avif/gif 图片", 400);
		}

		const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

		// 极少数情况下文件名撞车，换名重试而不是覆盖已有照片
		let name = "";
		for (let attempt = 0; attempt < 5 && !name; attempt++) {
			const candidate = makeFileName(file.name);
			try {
				await uploadRepoFile(
					repoPathOf(album, candidate),
					base64,
					`admin: 上传相册照片 ${album}/${candidate}`,
					{ overwrite: false },
				);
				name = candidate;
			} catch (e) {
				if (e instanceof FileExistsError) continue;
				throw e;
			}
		}
		if (!name) return jsonError("分配文件名失败，请重试", 500);

		return json({
			success: true,
			album,
			name,
			path: repoPathOf(album, name),
			size: file.size,
			isGif: isGif(name),
			rawUrl: rawUrlOf(repoPathOf(album, name)),
			localUrl: `/gallery/${album}/${name}`,
		});
	} catch (e) {
		return jsonError(e instanceof Error ? e.message : "上传失败", 500);
	}
};

// DELETE /api/admin/gallery - 删除照片
// body: { album: string, name: string }            删除单张
// body: { album: string, all: true }                删除该相册下全部照片（删相册时清空目录）
export const DELETE: APIRoute = async ({ request }) => {
	if (!verifyToken(request.headers.get("authorization"))) {
		return jsonError("未授权", 401);
	}

	try {
		const { album, name, all } = await request.json();
		if (typeof album !== "string" || !ALBUM_ID_RE.test(album)) {
			return jsonError("相册 ID 不合法", 400);
		}

		// 清空相册：逐个删除目录下的图片（GitHub 每次删除都是一次提交，
		// 串行执行避免并发写同一分支产生冲突）
		if (all === true) {
			const files = (await listRepoDir(albumDirOf(album))).filter((f) =>
				IMAGE_EXT_RE.test(f.name),
			);
			let deleted = 0;
			for (const f of files) {
				await deleteImage(f.path);
				deleted++;
			}
			return json({ success: true, deleted });
		}

		if (
			typeof name !== "string" ||
			name.includes("/") ||
			name.includes("..") ||
			!IMAGE_EXT_RE.test(name)
		) {
			return jsonError("文件名不合法", 400);
		}
		await deleteImage(repoPathOf(album, name));
		return json({ success: true });
	} catch (e) {
		return jsonError(e instanceof Error ? e.message : "删除失败", 500);
	}
};
