// QQ阅读（book.qq.com，阅文旗下）网文搜索解析。
// 搜索页是 Nuxt SSR，结果以 __NUXT__ 的 JS 字面量内嵌在 HTML 里：
//   __NUXT__=(function(a,b,...){return {...,lists:[{bid:468914,author:"天蚕土豆",...}]}}(0,null,...))
// 这里用字符串感知的小扫描器取出 lists 里的对象，再逐字段读取，
// 避免直接执行远端 JS（有安全风险）。

const UA =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export interface QQNovelHit {
	bid: string;
	title: string;
	author: string;
	intro: string;
	category: string;
	totalWords: number;
	finished: boolean;
}

type Scalar = string | number | boolean | null;

/** QQ阅读封面图床：目录取书号末三位，t5 为缩略图档位 */
export function qqCoverUrl(bid: string | number): string {
	const n = String(bid);
	return `https://wfqqreader-1252317822.image.myqcloud.com/cover/${Number(n) % 1000}/${n}/t5_${n}.jpg`;
}

function parseLiteral(raw: string): Scalar {
	const t = raw.trim();
	if (t === "null") return null;
	if (t === "true") return true;
	if (t === "false") return false;
	if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
	if (t.startsWith('"')) {
		try {
			return JSON.parse(t) as string;
		} catch {
			return "";
		}
	}
	return "";
}

/** 按逗号切分，忽略字符串里的逗号 */
function splitArgs(s: string): string[] {
	const out: string[] = [];
	let inStr = false;
	let esc = false;
	let start = 0;
	for (let i = 0; i < s.length; i++) {
		const ch = s[i];
		if (inStr) {
			if (esc) esc = false;
			else if (ch === "\\") esc = true;
			else if (ch === '"') inStr = false;
			continue;
		}
		if (ch === '"') inStr = true;
		else if (ch === ",") {
			out.push(s.slice(start, i));
			start = i + 1;
		}
	}
	out.push(s.slice(start));
	return out.map((x) => x.trim());
}

/** 从 lists:[ 开始，按大括号层级切出每个书对象（字符串里的括号不参与计数） */
function extractListObjects(src: string): string[] {
	const anchor = src.indexOf("lists:[");
	if (anchor < 0) return [];
	const objs: string[] = [];
	let depth = 0;
	let inStr = false;
	let esc = false;
	let start = -1;
	for (let i = anchor + "lists:[".length; i < src.length; i++) {
		const ch = src[i];
		if (inStr) {
			if (esc) esc = false;
			else if (ch === "\\") esc = true;
			else if (ch === '"') inStr = false;
			continue;
		}
		if (ch === '"') {
			inStr = true;
			continue;
		}
		if (ch === "{") {
			if (depth === 0) start = i;
			depth++;
			continue;
		}
		if (ch === "}") {
			depth--;
			if (depth === 0 && start >= 0) {
				objs.push(src.slice(start, i + 1));
				start = -1;
			}
			if (depth < 0) break;
			continue;
		}
		if (ch === "]" && depth === 0) break;
	}
	return objs;
}

/** 读一个字段：值可能是字面量，也可能是 Nuxt 压缩后的单字母变量 */
function readField(obj: string, name: string, vars: Record<string, Scalar>): Scalar {
	const re = new RegExp(
		`(?:^|[,{])${name}:("(?:[^"\\\\]|\\\\.)*"|null|true|false|-?\\d+(?:\\.\\d+)?|[A-Za-z_$][\\w$]*)`,
	);
	const m = re.exec(obj);
	if (!m) return "";
	const raw = m[1];
	if (/^[A-Za-z_$][\w$]*$/.test(raw) && raw !== "null" && raw !== "true" && raw !== "false") {
		return Object.prototype.hasOwnProperty.call(vars, raw) ? vars[raw] : "";
	}
	return parseLiteral(raw);
}

export function parseQQSearch(html: string): QQNovelHit[] {
	const anchor = html.indexOf("__NUXT__");
	if (anchor < 0) return [];
	const src = html.slice(anchor);

	// 函数形参与实参一一对应，例如 a=0, b=null, c=1, h="斗破苍穹"
	const paramsMatch = /^__NUXT__=\(function\(([^)]*)\)\{/.exec(src);
	const argsMatch = /\}\(([^()]*)\)\);/.exec(src);
	const vars: Record<string, Scalar> = {};
	if (paramsMatch && argsMatch) {
		const params = paramsMatch[1].split(",").map((s) => s.trim());
		const args = splitArgs(argsMatch[1]);
		params.forEach((p, i) => {
			vars[p] = parseLiteral(args[i] ?? "null");
		});
	}

	const hits: QQNovelHit[] = [];
	for (const obj of extractListObjects(src)) {
		const bid = String(readField(obj, "bid", vars) ?? "");
		if (!/^\d+$/.test(bid)) continue;
		const title = String(readField(obj, "title", vars) ?? "").trim();
		if (!title) continue;
		hits.push({
			bid,
			title,
			author: String(readField(obj, "author", vars) ?? "").trim(),
			intro: String(readField(obj, "intro", vars) ?? "").trim(),
			category: String(readField(obj, "category3Name", vars) ?? "").trim(),
			totalWords: Number(readField(obj, "totalWords", vars)) || 0,
			finished: (() => {
				const v = readField(obj, "finished", vars);
				return v === true || v === 1 || v === "1";
			})(),
		});
		if (hits.length >= 20) break;
	}
	return hits;
}

export async function fetchQQSearch(keyword: string): Promise<QQNovelHit[]> {
	const kw = String(keyword || "").trim();
	if (!kw) return [];
	const res = await fetch(`https://book.qq.com/so/${encodeURIComponent(kw)}`, {
		headers: {
			"User-Agent": UA,
			Accept: "text/html,application/xhtml+xml",
			"Accept-Language": "zh-CN,zh;q=0.9",
			"Accept-Encoding": "identity",
		},
	});
	if (!res.ok) return [];
	return parseQQSearch(await res.text());
}

export interface QQNovelDetail {
	bid: string;
	/** 首发年份（来自详情页 publishTime） */
	year: number;
	publishTime: string;
	updateTime: string;
}

/** QQ阅读书籍详情：取首发时间。搜索列表没有时间字段，导入时按书号补 */
export async function fetchQQDetail(bid: string | number): Promise<QQNovelDetail | null> {
	const id = String(bid || "").replace(/^qq-/, "");
	if (!/^\d+$/.test(id)) return null;
	const res = await fetch(`https://book.qq.com/book-detail/${id}`, {
		headers: {
			"User-Agent": UA,
			Accept: "text/html,application/xhtml+xml",
			"Accept-Language": "zh-CN,zh;q=0.9",
			"Accept-Encoding": "identity",
		},
	});
	if (!res.ok) return null;
	const html = await res.text();
	const publishTime = /publishTime:\s*"([^"]+)"/.exec(html)?.[1] || "";
	const updateTime = /更新时间[:：]\s*([\d-]{8,10})/.exec(html)?.[1] || "";
	const year = Number.parseInt((publishTime || updateTime).slice(0, 4), 10) || 0;
	return { bid: id, year, publishTime, updateTime };
}

