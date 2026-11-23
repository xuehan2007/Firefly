// 封面本地化脚本
// 把 anime/manga/novels 三个数据文件里的外链封面下载到 public/covers，
// 生成 src/constants/covers.json（外链 → 本地路径）供页面直接引用。
// 这样封面变成同源静态文件，不再每次经 /api/img/proxy 回源抓取。
// 已下载过的（本地文件存在）会跳过，可以反复执行。

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DATA_FILES = [
	"src/data/anime.json",
	"src/data/manga.json",
	"src/data/novels.json",
];
const OUTPUT_DIR = "public/covers";
const OUTPUT_URL_PREFIX = "/covers";
const MANIFEST_FILE = "src/constants/covers.json";
const COVER_WIDTH = 400;
const CONCURRENCY = 4;

type Manifest = Record<string, string>;

// 按图床带 Referer，避免第三方防盗链（与 /api/img/proxy 保持一致）
const REFERERS: Array<[string, string]> = [
	["bgm.tv", "https://bgm.tv/"],
	["qidian.qpic.cn", "https://www.qidiantu.com/"],
	["linovelib.com", "https://www.linovelib.com/"],
	["esjzone.one", "https://www.esjzone.one/"],
	["esjzone.cc", "https://www.esjzone.one/"],
	["esjzone.me", "https://www.esjzone.one/"],
	["masiro.me", "https://www.esjzone.one/"],
	["mangafunb.fun", "https://www.mangacopy.com/"],
	["mangafunb.xyz", "https://www.mangacopy.com/"],
	["pstatic.net", "https://comic.naver.com/"],
	["myqcloud.com", "https://book.qq.com/"],
	["hdslb.com", "https://www.bilibili.com/"],
];

function refererFor(host: string): string {
	const h = host.toLowerCase();
	for (const [suffix, referer] of REFERERS) {
		if (h === suffix || h.endsWith(`.${suffix}`)) return referer;
	}
	return "https://www.mangacopy.com/";
}

// 用 URL 的哈希做文件名，封面换了 URL 就会生成新文件，不会张冠李戴
function localName(url: string): string {
	const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
	return `${hash}.webp`;
}

async function exists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function readManifest(): Promise<Manifest> {
	try {
		return JSON.parse(await fs.readFile(MANIFEST_FILE, "utf-8")) as Manifest;
	} catch {
		return {};
	}
}

async function collectRemoteCovers(): Promise<string[]> {
	const urls = new Set<string>();
	for (const file of DATA_FILES) {
		let data: unknown;
		try {
			data = JSON.parse(await fs.readFile(file, "utf-8"));
		} catch {
			console.warn(`[covers] 读取失败，跳过：${file}`);
			continue;
		}
		// 数据文件形如 { anime: [...] } / { manga: [...] } / { novels: [...] }
		const record = (data ?? {}) as Record<string, unknown>;
		const items: unknown[] = Array.isArray(data)
			? data
			: (["anime", "manga", "novels", "items"] as const)
					.map((key) => record[key])
					.find(Array.isArray) || [];
		for (const item of items) {
			if (!item || typeof item !== "object") continue;
			const rec = item as Record<string, unknown>;
			for (const field of ["cover", "image"]) {
				const value = rec[field];
				if (typeof value === "string" && /^https?:\/\//i.test(value)) {
					urls.add(value);
				}
			}
		}
	}
	return [...urls];
}

async function downloadCover(url: string): Promise<string | null> {
	const fileName = localName(url);
	const localPath = path.join(OUTPUT_DIR, fileName);
	const localUrl = `${OUTPUT_URL_PREFIX}/${fileName}`;
	if (await exists(localPath)) return localUrl;

	try {
		const host = new URL(url).hostname;
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"FireflyBlog/1.0 (+https://github.com/xuehan2007/Firefly)",
				Referer: refererFor(host),
				Accept: "image/avif,image/webp,image/jpeg,image/png,image/*,*/*",
			},
			signal: AbortSignal.timeout(25000),
		});
		if (!response.ok) {
			console.warn(`[covers] 下载失败 HTTP ${response.status}: ${url}`);
			return null;
		}
		const buffer = Buffer.from(await response.arrayBuffer());
		await sharp(buffer)
			.rotate()
			.resize({ width: COVER_WIDTH, withoutEnlargement: true })
			.webp({ quality: 82, effort: 4 })
			.toFile(localPath);
		return localUrl;
	} catch (error) {
		console.warn(`[covers] 处理失败: ${url}`, error);
		return null;
	}
}

async function mapLimit<T>(
	items: T[],
	limit: number,
	worker: (item: T) => Promise<void>,
): Promise<void> {
	let index = 0;
	const workers = Array.from(
		{ length: Math.min(limit, items.length) },
		async () => {
			while (index < items.length) {
				const current = index;
				index += 1;
				await worker(items[current]);
			}
		},
	);
	await Promise.all(workers);
}

async function main() {
	const urls = await collectRemoteCovers();
	if (urls.length === 0) {
		console.log("[covers] 没有需要本地化的外链封面");
		return;
	}

	await fs.mkdir(OUTPUT_DIR, { recursive: true });
	const manifest = await readManifest();

	let downloaded = 0;
	await mapLimit(urls, CONCURRENCY, async (url) => {
		const localUrl = await downloadCover(url);
		if (!localUrl) return;
		if (manifest[url] !== localUrl) {
			manifest[url] = localUrl;
			downloaded += 1;
		}
	});

	// 排序后写回，避免每次构建产生无意义 diff
	const sorted: Manifest = {};
	for (const key of Object.keys(manifest).sort()) sorted[key] = manifest[key];
	await fs.writeFile(MANIFEST_FILE, `${JSON.stringify(sorted, null, 2)}\n`);

	const cached = urls.length - downloaded;
	console.log(
		`[covers] 完成：${urls.length} 张外链封面，${downloaded} 张新下载，${cached} 张已缓存`,
	);
}

main().catch((error) => {
	console.error("[covers] 执行失败:", error);
	process.exit(1);
});
