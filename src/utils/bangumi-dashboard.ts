// 后台「番剧 / 漫画」共用的 Bangumi 数据整理逻辑。
// dashboard.astro 里两套导入流程同构，历史上改一处漏一处（封面代理、
// volumes/eps、作者键名都出过只修一边的问题），统一收敛到这里。

export interface MediaEntry {
	id: string;
	title: string;
	titleJp: string;
	cover: string;
	// 条目平台（漫画/小说/画集…），目前仅漫画搜索结果展示
	platform: string;
	score: number;
	status: string;
	progress: number;
	totalEpisodes: number;
	// 计量单位：番剧=集；漫画=话/卷（有话数优先记话，没有再记卷）
	unit: string;
	year: number;
	studio: string;
	tags: string[];
	synopsis: string;
	review: string;
	reviewDate: string;
}

export type MediaKind = "anime" | "manga";

interface BangumiImages {
	large?: string;
}

interface BangumiInfoboxItem {
	key?: string;
	value?: string | Array<{ v?: string }>;
}

export interface BangumiSubject {
	id: number;
	name?: string;
	name_cn?: string;
	date?: string | null;
	eps?: number;
	volumes?: number;
	platform?: string;
	summary?: string;
	images?: BangumiImages | null;
	infobox?: BangumiInfoboxItem[];
}

/** 外链封面改走本站同源代理（/api/img/proxy），避免国内手机直连 lain.bgm.tv 失败 */
export function proxyCover(url: string, w?: number): string {
	if (!url || !/^https?:\/\//i.test(url)) return url || "";
	return `/api/img/proxy?url=${encodeURIComponent(url)}${w ? `&w=${w}` : ""}`;
}

/** "8+8(番外)" / "24" 这类文本只取开头数字，取不到返回 0 */
function leadingInt(v: string): number {
	const m = /^\s*(\d+)/.exec(String(v || ""));
	return m ? Number.parseInt(m[1], 10) : 0;
}

/**
 * 把搜索接口返回的条目映射成后台编辑结构。
 * - 番剧：eps = 集数，缺失时默认 12
 * - 漫画：有话数(eps)优先记「话」，没有话数再用册数(volumes)记「卷」
 */
export function mapBangumiSubject(
	s: BangumiSubject,
	kind: MediaKind,
): MediaEntry {
	const base: MediaEntry = {
		id: String(s.id),
		title: s.name_cn || s.name || "",
		titleJp: s.name || "",
		cover:
			s.images && s.images.large
				? s.images.large.replace("http://", "https://")
				: "",
		platform: s.platform || "",
		score: 3,
		status: "planned",
		progress: 0,
		totalEpisodes: 0,
		unit: kind === "anime" ? "集" : "话",
		year: s.date ? Number.parseInt(s.date.substring(0, 4), 10) : new Date().getFullYear(),
		studio: "",
		tags: [],
		synopsis: s.summary || "",
		review: "",
		reviewDate: "",
	};

	if (kind === "anime") {
		base.totalEpisodes = s.eps || 12;
	} else if (s.eps) {
		// 漫画条目里 eps 是话数
		base.totalEpisodes = s.eps;
		base.unit = "话";
	} else if (s.volumes) {
		base.totalEpisodes = s.volumes;
		base.unit = "卷";
	}
	return base;
}

/** 从详情接口的 infobox 取一项；值可能是字符串，也可能是 [{v:"..."}] 数组 */
export function bangumiInfoboxValue(
	infobox: BangumiInfoboxItem[] | undefined,
	key: string,
): string {
	const hit = (infobox || []).find((e) => e && e.key === key);
	if (!hit) return "";
	const v = hit.value;
	if (typeof v === "string") return v;
	if (Array.isArray(v)) {
		for (const part of v) {
			if (part && typeof part.v === "string") return part.v;
		}
	}
	return "";
}

/**
 * 用详情接口补全搜索接口给不了的资料（作者/出版社、总量）。
 * 注意键名随条目类型而变：书籍叫「作者」，漫画多为「原作/作画/脚本」。
 * 返回实际补全的项名，供提示用（Bangumi 上资料缺失时数组可能为空）。
 */
export function enrichMangaFromDetail(
	item: MediaEntry,
	d: BangumiSubject,
): string[] {
	const filled: string[] = [];

	const authors: string[] = [];
	for (const k of ["作者", "原作", "作画", "脚本"]) {
		const v = bangumiInfoboxValue(d.infobox, k);
		if (v && !authors.includes(v)) authors.push(v);
	}
	const publisher = bangumiInfoboxValue(d.infobox, "出版社");
	const parts = [...authors.slice(0, 2), publisher].filter(Boolean);
	if (parts.length > 0) {
		item.studio = parts.join(" / ");
		filled.push("作者/出版社");
	}

	// 用户规则：有话数优先显示话，没有话再显示卷
	const eps = leadingInt(bangumiInfoboxValue(d.infobox, "话数")) || d.eps || 0;
	const vols = leadingInt(bangumiInfoboxValue(d.infobox, "册数")) || d.volumes || 0;
	if (eps) {
		item.totalEpisodes = eps;
		item.unit = "话";
		filled.push("总话数");
	} else if (vols) {
		item.totalEpisodes = vols;
		item.unit = "卷";
		filled.push("总卷数");
	}

	if (d.date) {
		const y = Number.parseInt(d.date.substring(0, 4), 10);
		if (y) item.year = y;
	}
	if (d.summary && !item.synopsis) item.synopsis = d.summary;

	return filled;
}
