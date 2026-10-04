// LQIP 方案来源: https://blog.cosine.ren/post/astro-lqip-implementation

import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { glob } from "glob";
import sharp from "sharp";

const SRC_DIR = "src";
const PUBLIC_DIR = "public";
const OUTPUT_FILE = "src/constants/lqips.json";
// 内容指纹缓存（key -> 文件内容 sha256）。仅本脚本使用，不进运行时代码；
// 按内容而非路径失效，同名替换图片后会自动重算占位色。
const CACHE_FILE = "src/constants/.lqip-cache.json";
// 需要忽略的目录（相对于项目根目录）
const IGNORE_DIRS = [
	"public/favicon/**",
	"public/pio/**",
	"public/assets/images/effects/**",
	"public/assets/music/**",
	"public/vndb-covers/**",
];

interface RgbColor {
	r: number;
	g: number;
	b: number;
}

type LqipMap = Record<string, string>;

function rgbToHex(color: RgbColor): string {
	const hex = (n: number) => n.toString(16).padStart(2, "0");
	return `#${hex(color.r)}${hex(color.g)}${hex(color.b)}`;
}

async function processImage(imagePath: string): Promise<string | null> {
	try {
		const { data, info } = await sharp(imagePath)
			.resize(2, 2, { fit: "fill" })
			.raw()
			.toBuffer({ resolveWithObject: true });

		const channels = info.channels;
		const colors: RgbColor[] = [];

		for (let i = 0; i < 4; i++) {
			const offset = i * channels;
			colors.push({
				r: data[offset],
				g: data[offset + 1],
				b: data[offset + 2],
			});
		}

		// 使用 corners[0], [1], [3] 生成 135deg 斜向渐变
		const compact = `${rgbToHex(colors[0]).slice(1)}${rgbToHex(colors[1]).slice(1)}${rgbToHex(colors[3]).slice(1)}`;
		return compact;
	} catch (error) {
		console.error(`Error processing ${imagePath}:`, error);
		return null;
	}
}

function filePathToKey(filePath: string): string {
	if (filePath.startsWith(PUBLIC_DIR)) {
		return `public:${path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/")}`;
	}
	return `src:${path.relative(SRC_DIR, filePath).replace(/\\/g, "/")}`;
}

async function readJsonMap(file: string): Promise<LqipMap> {
	try {
		const content = await fs.readFile(file, "utf-8");
		return JSON.parse(content) as LqipMap;
	} catch {
		return {};
	}
}

async function hashFile(filePath: string): Promise<string> {
	const buf = await fs.readFile(filePath);
	return createHash("sha256").update(buf).digest("hex");
}

async function writeIfChanged(
	file: string,
	data: unknown,
): Promise<boolean> {
	const next = JSON.stringify(data, null, 2);
	let prev = "";
	try {
		prev = await fs.readFile(file, "utf-8");
	} catch {
		// 文件不存在
	}
	if (prev === next) return false;
	await fs.mkdir(path.dirname(file), { recursive: true });
	await fs.writeFile(file, next, "utf-8");
	return true;
}

async function main() {
	// 读取已有的占位色与内容指纹缓存
	const existingLqips = await readJsonMap(OUTPUT_FILE);
	const hashCache = await readJsonMap(CACHE_FILE);
	console.log(
		`Loaded ${Object.keys(existingLqips).length} existing entries from ${OUTPUT_FILE}`,
	);

	const files = await glob("{src,public}/**/*.{png,jpg,jpeg,webp,avif}", {
		ignore: IGNORE_DIRS,
	});

	if (files.length === 0) {
		console.log("No image files found.");
		return;
	}

	// 移除已不存在的图片数据（两个文件同步清理）
	const currentKeys = new Set(files.map((file) => filePathToKey(file)));
	const removedKeys = Object.keys(existingLqips).filter(
		(key) => !currentKeys.has(key),
	);
	for (const key of removedKeys) {
		delete existingLqips[key];
		delete hashCache[key];
	}
	if (removedKeys.length > 0) {
		console.log(
			`Removed ${removedKeys.length} stale entries: ${removedKeys.join(", ")}`,
		);
	}

	// 按内容指纹筛出新增/被替换的图片（同名同路径但内容变了也会重算）
	const pending: string[] = [];
	let cached = 0;
	for (const file of files) {
		const key = filePathToKey(file);
		const hash = await hashFile(path.resolve(file));
		if (hashCache[key] === hash && existingLqips[key] !== undefined) {
			cached++;
		} else {
			pending.push(file);
			hashCache[key] = hash;
		}
	}

	console.log(
		`Found ${files.length} images, ${cached} unchanged, ${pending.length} new/changed to process.`,
	);

	const lqips: LqipMap = { ...existingLqips };
	let processed = 0;
	const failed: string[] = [];

	for (const file of pending) {
		process.stdout.write(`\rProcessing ${processed + 1}/${pending.length}...`);
		const key = filePathToKey(file);
		const compact = await processImage(path.resolve(file));
		if (compact !== null) {
			lqips[key] = compact;
			processed++;
		} else {
			// 处理失败：不写入占位色也不更新指纹，下次运行自动重试
			delete hashCache[key];
			failed.push(key);
		}
	}

	const lqipsChanged = await writeIfChanged(OUTPUT_FILE, lqips);
	const cacheChanged = await writeIfChanged(CACHE_FILE, hashCache);

	console.log(
		`\nDone! Processed ${processed}/${pending.length} new/changed images (${cached} cached). Total: ${Object.keys(lqips).length}.`,
	);
	console.log(
		`${OUTPUT_FILE} ${lqipsChanged ? "updated" : "unchanged"}, ${CACHE_FILE} ${cacheChanged ? "updated" : "unchanged"}.`,
	);
	if (failed.length > 0) {
		console.warn(`Failed to process ${failed.length} images: ${failed.join(", ")}`);
	}
}

main();
