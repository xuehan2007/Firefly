// Firefly 壁纸母版生成器
//
// 用法（在项目根目录执行，sharp 从项目依赖解析）：
//   node .trae/skills/pixiv-wallpaper-update/scripts/make-masters.mjs \
//     <原图目录> <输出目录> <目标宽度> <文件名前缀> <起始编号>
//
// 例：
//   node .trae/skills/pixiv-wallpaper-update/scripts/make-masters.mjs \
//     src/assets/wallpapers/_inbox/ruilur/desktop /tmp/masters 3840 ba-wallpaper- 51
//
// 规则：等比缩放不裁切，JPEG quality 92 / 4:4:4 / mozjpeg（与既有母版一致）。
// 桌面传 3840，手机传 1600。

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const requireFromProject = createRequire(path.resolve("package.json"));
let sharp;
try {
	sharp = requireFromProject("sharp");
} catch {
	console.error("无法从项目依赖加载 sharp，请在项目根目录运行并确认已 pnpm install。");
	process.exit(1);
}

const [inboxDir, outDir, widthArg, prefix, startArg] = process.argv.slice(2);
if (!inboxDir || !outDir || !widthArg || !prefix || !startArg) {
	console.error(
		"参数不足。用法: make-masters.mjs <原图目录> <输出目录> <目标宽度> <前缀> <起始编号>",
	);
	process.exit(1);
}

const targetWidth = Number(widthArg);
const startNum = Number(startArg);
if (!Number.isInteger(targetWidth) || targetWidth <= 0 || !Number.isInteger(startNum)) {
	console.error("目标宽度和起始编号必须是正整数。");
	process.exit(1);
}

const files = fs
	.readdirSync(inboxDir)
	.filter(f => /\.(jpe?g|png|webp)$/i.test(f))
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
	console.error(`目录 ${inboxDir} 下没有图片。`);
	process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const results = [];
for (let i = 0; i < files.length; i++) {
	const num = startNum + i;
	const outName = `${prefix}${num}.jpg`;
	const outPath = path.join(outDir, outName);
	const srcPath = path.join(inboxDir, files[i]);

	const meta = await sharp(srcPath, { failOn: "none" }).metadata();
	if (meta.width < targetWidth) {
		console.warn(
			`警告: ${files[i]} 源宽 ${meta.width}px 小于目标 ${targetWidth}px，放大可能模糊（继续生成）`,
		);
	}
	const h = Math.round((meta.height / meta.width) * targetWidth);

	await sharp(srcPath, { failOn: "none" })
		.resize(targetWidth, h, { fit: "fill", kernel: "lanczos3" })
		.jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
		.toFile(outPath);

	const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
	results.push(`${outName}  ${targetWidth}x${h}  ${kb}KB  <- ${files[i]}`);
}

console.log(results.join("\n"));
console.log(`完成: ${files.length} 张 -> ${path.resolve(outDir)}`);
