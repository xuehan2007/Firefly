/**
 * 切页 View Transitions（morph）工具
 *
 * 列表封面与文章详情封面共用同一个 `view-transition-name`（`cover-<entry.id>`），
 * 由服务端静态生成 —— 前进/后退都能自动 morph，无需点击时动态赋名。
 */

type DocumentWithViewTransition = Document & {
	startViewTransition?: (cb: () => void | Promise<void>) => unknown;
};

/** View Transitions API 是否可用（且用户未开启系统「减弱动态效果」） */
export function supportsViewTransition(): boolean {
	if (typeof document === "undefined") return false;
	const doc = document as DocumentWithViewTransition;
	if (typeof doc.startViewTransition !== "function") return false;
	return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 由文章 entry.id 生成封面 morph 名。
 * 前缀 `cover-` 保证以字母开头（合法 custom-ident），
 * 非法字符（空格 / 点 / 斜杠等）统一替换为 `-`。
 * 同一个 entry.id 在列表页与详情页得到完全相同的结果，两端才能对上。
 */
export function getCoverVtName(entryId: string): string {
	const safe = entryId
		.replace(/[^\p{L}\p{N}_-]+/gu, "-")
		.replace(/^-+|-+$/g, "");
	return `cover-${safe || "entry"}`;
}
