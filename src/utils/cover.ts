// 外链封面统一走本站同源代理 (/api/img/proxy)，
// 避免国内手机直连第三方图床（lain.bgm.tv 等）加载失败。
// 传 w 让代理返回指定宽度的缩略图，手机不再下载原图。
//
// 历史上漫画/番剧列表页、详情页、后台各写了一份相同逻辑，统一收敛到这里。

export function proxyCoverUrl(url?: string, w?: number): string {
	if (!url || !/^https?:\/\//i.test(url)) return url || "";
	return `/api/img/proxy?url=${encodeURIComponent(url)}${w ? `&w=${w}` : ""}`;
}

const XML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&apos;",
};

/**
 * 没有封面时的文字封面：白底黑字，书名按字折行居中。
 * 返回可直接塞进 <img src> 的 SVG data URL。
 */
export function textCoverUrl(title: string, width = 300, height = 400): string {
	const raw = String(title || "").trim() || "未命名";
	const chars = Array.from(raw);
	// 每行 7 个中文字符，两侧各留约 10% 边距
	const perLine = 7;
	const maxLines = 7;
	const lines: string[] = [];
	for (let i = 0; i < chars.length; i += perLine) {
		lines.push(chars.slice(i, i + perLine).join(""));
	}
	if (lines.length > maxLines) {
		lines.length = maxLines;
		lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, perLine - 1)}…`;
	}
	const fontSize = lines.length <= 2 ? 38 : lines.length <= 4 ? 30 : 24;
	const lineHeight = Math.round(fontSize * 1.45);
	const centerX = width / 2;
	const startY = (height - lines.length * lineHeight) / 2 + fontSize;
	const esc = (s: string) => s.replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);
	const textLines = lines
		.map(
			(line, i) =>
				`<text x="${centerX}" y="${startY + i * lineHeight}" text-anchor="middle" font-family="'Noto Serif SC','Songti SC','SimSun',serif" font-size="${fontSize}" font-weight="600" fill="#111111">${esc(line)}</text>`,
		)
		.join("");
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
		`<rect width="${width}" height="${height}" fill="#ffffff"/>` +
		`<rect x="14" y="14" width="${width - 28}" height="${height - 28}" fill="none" stroke="#e8e8e8" stroke-width="1"/>` +
		textLines +
		`<text x="${centerX}" y="${height - 34}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="11" letter-spacing="4" fill="#b0b0b0">NOVEL</text>` +
		`</svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

