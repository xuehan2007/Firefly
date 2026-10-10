// 阅读位置记忆（会话级）：
// - 文章页：记录滚动位置，本次访问内打开同一文章自动回到上次位置；读到底部清除。
// - 主页/列表页：记录滚动位置，从文章页返回时自动回到上次点击文章的位置。
// 存储用 sessionStorage：关闭标签页/浏览器后自动清空，重新打开博客从顶部开始；
// 同一标签页内站内跳转（含 swup 软导航）记忆正常生效。
// 后退/前进（popstate）不干预，交给浏览器/swup 自己的滚动恢复。

const STORAGE_PREFIX = "reading-pos:";
const MAX_AGE_MS: number = 30 * 24 * 3600 * 1000; // 兜底用（sessionStorage 随会话清空，正常不会触达）
const MIN_SAVE_Y = 300; // 刚开头不记
const BOTTOM_GAP = 160; // 距底部不足 160px 视为已读完

function isPostPage(pathname: string): boolean {
	return /\/posts\/.+/.test(pathname);
}

function storageKey(path: string): string {
	return STORAGE_PREFIX + path;
}

// 惰性清理过期/损坏的记录，并限制总条数防止 sessionStorage 无限增长
function prune(): void {
	const now = Date.now();
	const keys: string[] = [];
	try {
		for (let i = sessionStorage.length - 1; i >= 0; i--) {
			const k = sessionStorage.key(i);
			if (!k?.startsWith(STORAGE_PREFIX)) continue;
			try {
				const v = JSON.parse(sessionStorage.getItem(k) || "null");
				if (!v || now - v.t > MAX_AGE_MS) {
					sessionStorage.removeItem(k);
				} else {
					keys.push(k);
				}
			} catch {
				sessionStorage.removeItem(k);
			}
		}
		// 超过上限：按时间从旧到新删除多余的
		const MAX_ENTRIES = 50;
		if (keys.length > MAX_ENTRIES) {
			const entries = keys
				.map((k) => {
					let t = 0;
					try {
						t = JSON.parse(sessionStorage.getItem(k) || "{}").t || 0;
					} catch {}
					return { k, t };
				})
				.sort((a, b) => a.t - b.t);
			for (let i = 0; i < entries.length - MAX_ENTRIES; i++) {
				sessionStorage.removeItem(entries[i].k);
			}
		}
	} catch {}
}

// 保存当前页面滚动位置（文章页或列表页都存）
function save(): void {
	const path = location.pathname;
	const y = Math.round(window.scrollY);
	const max = document.documentElement.scrollHeight - window.innerHeight;
	try {
		if (isPostPage(path)) {
			// 文章页：读到底部清除记录
			if (max - y <= BOTTOM_GAP) {
				sessionStorage.removeItem(storageKey(path));
			} else if (y > MIN_SAVE_Y) {
				sessionStorage.setItem(
					storageKey(path),
					JSON.stringify({ y, t: Date.now() }),
				);
			}
		} else {
			// 列表页（主页/归档/分类/标签等）：只记 y>MIN_SAVE_Y 的位置，
			// 方便从文章页返回时恢复到"上次看到的位置"
			if (y > MIN_SAVE_Y) {
				sessionStorage.setItem(
					storageKey(path),
					JSON.stringify({ y, t: Date.now() }),
				);
			} else {
				// 滚到顶部附近，清除记录（下次从头看）
				sessionStorage.removeItem(storageKey(path));
			}
		}
	} catch {}
}

function restore(): void {
	const path = location.pathname;
	let y = 0;
	try {
		const v = JSON.parse(sessionStorage.getItem(storageKey(path)) || "null");
		if (v && Date.now() - v.t <= MAX_AGE_MS) y = Math.trunc(v.y) || 0;
	} catch {}
	if (y <= MIN_SAVE_Y) return;

	const doScroll = () => window.scrollTo(0, y);
	if (document.readyState === "complete") {
		requestAnimationFrame(doScroll);
	} else {
		window.addEventListener("load", doScroll, { once: true });
		setTimeout(doScroll, 1200); // 兜底：load 迟迟不来也能恢复
	}
	// 图片等资源可能造成布局偏移，700ms 后若位置仍差很多再校正一次
	setTimeout(() => {
		if (Math.abs(window.scrollY - y) > 200) doScroll();
	}, 700);
}

// rAF 节流保存
let ticking = false;
window.addEventListener(
	"scroll",
	() => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			ticking = false;
			save();
		});
	},
	{ passive: true },
);

// popstate（后退/前进）时跳过恢复：浏览器和 swup 各自有滚动恢复
let skipNextRestore = false;
window.addEventListener("popstate", () => {
	skipNextRestore = true;
	setTimeout(() => {
		skipNextRestore = false;
	}, 800);
});

prune();

// 首次加载：back_forward 交给浏览器原生恢复
const navType: string | undefined = (
	performance.getEntriesByType("navigation")[0] as
		| PerformanceNavigationTiming
		| undefined
)?.type;
if (navType !== "back_forward") {
	restore();
}

// swup 软导航进入页面（文章页或列表页都恢复）
document.addEventListener("astro:page-load", () => {
	if (!skipNextRestore) restore();
});
