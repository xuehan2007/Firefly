// 为后台管理页预生成壁纸缩略图（构建期静态文件，不依赖运行时 /_image 端点）：
// - 全部壁纸 → public/wallpaper-thumbs/[/mobile]/name.webp（320px，后台网格缩略图）
// - 桌面壁纸 → public/wallpaper-large/name.webp（1920px，后台登录页随机背景）
// 映射关系写入 src/constants/wallpaper-thumbs.json 供 dashboard.astro 直接使用。
// 已存在且不旧于源文件则跳过；源文件已删除的过时产物会被清理。
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = path.resolve("src/assets/wallpapers");
const THUMB_DIR = path.resolve("public/wallpaper-thumbs");
const LARGE_DIR = path.resolve("public/wallpaper-large");
const MANIFEST = path.resolve("src/constants/wallpaper-thumbs.json");

const THUMB_WIDTH = 320;
const THUMB_QUALITY = 70;
const LARGE_WIDTH = 1920;
const LARGE_QUALITY = 80;

interface Manifest {
	thumbs: Record<string, string>;
	desktopLarge: string[];
}

function ensureDir(dir: string) {
	fs.mkdirSync(dir, { recursive: true });
}

// 产物已存在且不旧于源文件则跳过
async function convertIfStale(
	src: string,
	out: string,
	width: number,
	quality: number,
): Promise<boolean> {
	if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
		return false;
	}
	await sharp(src).resize({ width }).webp({ quality }).toFile(out);
	return true;
}

async function main() {
	if (!fs.existsSync(SRC_DIR)) {
		console.log("[wallpaper-thumbs] 壁纸目录不存在，跳过");
		return;
	}
	ensureDir(THUMB_DIR);
	ensureDir(path.join(THUMB_DIR, "mobile"));
	ensureDir(LARGE_DIR);

	const desktopFiles = fs
		.readdirSync(SRC_DIR)
		.filter((f) => /\.jpe?g$/i.test(f))
		.sort();
	const mobileDir = path.join(SRC_DIR, "mobile");
	const mobileFiles = fs.existsSync(mobileDir)
		? fs
				.readdirSync(mobileDir)
				.filter((f) => /\.jpe?g$/i.test(f))
				.sort()
		: [];

	const manifest: Manifest = { thumbs: {}, desktopLarge: [] };
	let made = 0;
	let skipped = 0;

	for (const f of desktopFiles) {
		const src = path.join(SRC_DIR, f);
		const base = f.replace(/\.jpe?g$/i, "");
		const thumbName = `${base}.webp`;
		const thumbOut = path.join(THUMB_DIR, thumbName);
		const largeOut = path.join(LARGE_DIR, thumbName);

		if (await convertIfStale(src, thumbOut, THUMB_WIDTH, THUMB_QUALITY)) {
			made++;
		} else {
			skipped++;
		}
		if (await convertIfStale(src, largeOut, LARGE_WIDTH, LARGE_QUALITY)) {
			made++;
		} else {
			skipped++;
		}

		manifest.thumbs[`assets/wallpapers/${f}`] = `/wallpaper-thumbs/${thumbName}`;
		manifest.desktopLarge.push(`/wallpaper-large/${thumbName}`);
	}

	for (const f of mobileFiles) {
		const src = path.join(mobileDir, f);
		const base = f.replace(/\.jpe?g$/i, "");
		const thumbName = `${base}.webp`;
		const thumbOut = path.join(THUMB_DIR, "mobile", thumbName);

		if (await convertIfStale(src, thumbOut, THUMB_WIDTH, THUMB_QUALITY)) {
			made++;
		} else {
			skipped++;
		}
		manifest.thumbs[`assets/wallpapers/mobile/${f}`] =
			`/wallpaper-thumbs/mobile/${thumbName}`;
	}

	// 清理源文件已删除的过时产物
	let pruned = 0;
	const expectedThumbs = new Set(Object.values(manifest.thumbs));
	const expectedLarge = new Set(manifest.desktopLarge);
	for (const [dir, prefix, expected] of [
		[THUMB_DIR, "/wallpaper-thumbs", expectedThumbs],
		[path.join(THUMB_DIR, "mobile"), "/wallpaper-thumbs/mobile", expectedThumbs],
		[LARGE_DIR, "/wallpaper-large", expectedLarge],
	] as const) {
		for (const f of fs.readdirSync(dir)) {
			if (!f.endsWith(".webp")) continue;
			if (!expected.has(`${prefix}/${f}`)) {
				fs.unlinkSync(path.join(dir, f));
				pruned++;
			}
		}
	}

	fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
	console.log(
		`[wallpaper-thumbs] 完成：桌面 ${desktopFiles.length} 张 / 移动 ${mobileFiles.length} 张，` +
			`新编码 ${made}，跳过 ${skipped}，清理 ${pruned}`,
	);
}

main().catch((e) => {
	console.error("[wallpaper-thumbs] 失败:", e);
	process.exit(1);
});
