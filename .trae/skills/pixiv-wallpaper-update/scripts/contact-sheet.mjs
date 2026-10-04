// Firefly 壁纸预览拼图（带文件名标签）
//
// 用法（在项目根目录执行，sharp 从项目依赖解析）：
//   node .trae/skills/pixiv-wallpaper-update/scripts/contact-sheet.mjs \
//     <图片目录> <输出jpg> [列数=5] [单片宽px=400]
//
// 例：
//   node .trae/skills/pixiv-wallpaper-update/scripts/contact-sheet.mjs \
//     src/assets/wallpapers/_inbox/ruilur/desktop _preview-desktop.jpg 4 520

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

const [srcDir, outFile, colsArg, tileWArg] = process.argv.slice(2);
if (!srcDir || !outFile) {
	console.error("参数不足。用法: contact-sheet.mjs <图片目录> <输出jpg> [列数] [单片宽]");
	process.exit(1);
}
const cols = Math.max(1, Number(colsArg) || 5);
const tileW = Math.max(64, Number(tileWArg) || 400);
const gap = 6;
const labelH = 28;

function labelSvg(text) {
	const safe = String(text).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
	return Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${labelH}">` +
			`<rect width="100%" height="100%" fill="rgba(0,0,0,0.75)"/>` +
			`<text x="8" y="19" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffd54a">${safe}</text>` +
			`</svg>`,
	);
}

const names = fs
	.readdirSync(srcDir)
	.filter(f => /\.(jpe?g|png|webp)$/i.test(f))
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (names.length === 0) {
	console.error(`目录 ${srcDir} 下没有图片。`);
	process.exit(1);
}

const tiles = [];
const heights = [];
for (const n of names) {
	const p = path.join(srcDir, n);
	const meta = await sharp(p).metadata();
	const h = Math.round((meta.height / meta.width) * tileW);
	const label = path.basename(n, path.extname(n));
	const tile = await sharp(p)
		.resize(tileW, h, { fit: "cover" })
		.extend({ bottom: labelH, background: "#000" })
		.composite([{ input: labelSvg(label), left: 0, top: h }])
		.jpeg({ quality: 80 })
		.toBuffer();
	tiles.push(tile);
	heights.push(h + labelH);
}

const rows = Math.ceil(names.length / cols);
const rowHeights = Array(rows).fill(0);
heights.forEach((h, i) => {
	const r = Math.floor(i / cols);
	rowHeights[r] = Math.max(rowHeights[r], h);
});
const canvasW = cols * tileW + (cols - 1) * gap;
const canvasH = rowHeights.reduce((a, b) => a + b, 0) + (rows - 1) * gap;

const layers = [];
heights.forEach((h, i) => {
	const c = i % cols;
	const r = Math.floor(i / cols);
	const x = c * (tileW + gap);
	const y = rowHeights.slice(0, r).reduce((a, b) => a + b, 0) + r * gap;
	layers.push({ input: tiles[i], left: x, top: y });
});

await sharp({ create: { width: canvasW, height: canvasH, channels: 3, background: "#222" } })
	.composite(layers)
	.jpeg({ quality: 82 })
	.toFile(outFile);

console.log(`${outFile} (${names.length} imgs, ${canvasW}x${canvasH})`);
