// 为 public/uploads 正文图片生成响应式小档：name-750.webp / name-1080.webp / name-1440.webp
// 仅生成比原图宽度小的档；已存在且不旧于源文件则跳过。
// rehype-uploads-srcset.mjs 在构建时按这些文件是否存在给正文 <img> 补 srcset。
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const UPLOADS_DIR = path.resolve("public/uploads");
const WIDTHS = [750, 1080, 1440];
const EXT_RE = /\.(webp|png|jpe?g)$/i;
// 已生成的变体文件名形如 name-750.webp，避免把变体当源图再生成
const VARIANT_RE = /-\d+\.(webp|png|jpe?g)$/i;

async function main() {
	if (!fs.existsSync(UPLOADS_DIR)) {
		console.log("[uploads-variants] public/uploads 不存在，跳过");
		return;
	}
	const files = fs
		.readdirSync(UPLOADS_DIR)
		.filter((f) => EXT_RE.test(f) && !VARIANT_RE.test(f));

	let made = 0;
	let skipped = 0;
	for (const file of files) {
		const src = path.join(UPLOADS_DIR, file);
		const meta = await sharp(src).metadata();
		const w = meta.width || 0;
		if (!w) continue;
		const base = file.replace(EXT_RE, "");
		const srcMtime = fs.statSync(src).mtimeMs;
		for (const target of WIDTHS) {
			if (target >= w) continue;
			const out = path.join(UPLOADS_DIR, `${base}-${target}.webp`);
			if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcMtime) {
				skipped++;
				continue;
			}
			await sharp(src)
				.resize({ width: target })
				.webp({ quality: 80 })
				.toFile(out);
			made++;
			console.log(`[uploads-variants] ${file} -> ${base}-${target}.webp`);
		}
	}
	console.log(`[uploads-variants] 完成：新生成 ${made}，已存在跳过 ${skipped}`);
}

main().catch((e) => {
	console.error("[uploads-variants] 失败:", e);
	process.exit(1);
});
