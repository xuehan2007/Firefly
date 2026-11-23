// 外链封面统一走本站同源代理 (/api/img/proxy)，
// 避免国内手机直连第三方图床（lain.bgm.tv 等）加载失败。
// 传 w 让代理返回指定宽度的缩略图，手机不再下载原图。
//
// 历史上漫画/番剧列表页、详情页、后台各写了一份相同逻辑，统一收敛到这里。

// 腾讯系 CDN（起点书封、QQ阅读封面）国内可直连，跳过站内代理少一跳，加载更快
const DIRECT_CDN_HOSTS = ["qidian.qpic.cn", "myqcloud.com"];

export function proxyCoverUrl(url?: string, w?: number): string {
	if (!url || !/^https?:\/\//i.test(url)) return url || "";
	try {
		const host = new URL(url).hostname.toLowerCase();
		if (DIRECT_CDN_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return url;
	} catch {
		// URL 解析失败就继续走代理
	}
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
 * 没有封面时的文字封面：白底黑字，书名折行居中，作者小字放在下面。
 * 返回可直接塞进 <img src> 的 SVG data URL。
 */
export function textCoverUrl(title: string, author = "", width = 300, height = 400): string {
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
	const fontSize = lines.length <= 2 ? 36 : lines.length <= 4 ? 28 : 22;
	const lineHeight = Math.round(fontSize * 1.42);
	const centerX = width / 2;

	// 作者名：小一号的灰字，过长截断
	const authorRaw = String(author || "").trim();
	const authorText =
		Array.from(authorRaw).length > 12
			? `${Array.from(authorRaw).slice(0, 11).join("")}…`
			: authorRaw;
	const authorFontSize = Math.max(11, Math.round(fontSize * 0.42));
	const authorGap = authorFontSize + 18;
	const dividerGap = 18;

	// 书名块 + 分隔线 + 作者整体在封面里居中
	const blockHeight =
		lines.length * lineHeight + (authorText ? dividerGap + authorGap : 0);
	const firstBaseline = (height - blockHeight) / 2 + fontSize;
	const lastBaseline = firstBaseline + (lines.length - 1) * lineHeight;

	const esc = (s: string) => s.replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);
	const textLines = lines
		.map(
			(line, i) =>
				`<text x="${centerX}" y="${firstBaseline + i * lineHeight}" text-anchor="middle" font-family="'Noto Serif SC','Songti SC','SimSun',serif" font-size="${fontSize}" font-weight="600" fill="#111111">${esc(line)}</text>`,
		)
		.join("");

	const dividerY = lastBaseline + Math.round(dividerGap * 0.6);
	const divider = authorText
		? `<line x1="${centerX - 14}" y1="${dividerY}" x2="${centerX + 14}" y2="${dividerY}" stroke="#d4d4d4" stroke-width="1"/>`
		: "";
	const authorLine = authorText
		? `<text x="${centerX}" y="${dividerY + authorGap - 6}" text-anchor="middle" font-family="'Noto Serif SC','Songti SC','SimSun',serif" font-size="${authorFontSize}" fill="#666666">${esc(authorText)}</text>`
		: "";

	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
		`<rect width="${width}" height="${height}" fill="#ffffff"/>` +
		`<rect x="14" y="14" width="${width - 28}" height="${height - 28}" fill="none" stroke="#e8e8e8" stroke-width="1"/>` +
		textLines +
		divider +
		authorLine +
		`</svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg).replace(/'/g, "%27")}`;
}

