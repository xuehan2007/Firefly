// 阅读位置记忆：文章页的滚动位置按路径存入 localStorage，
// 下次打开同一文章自动回到上次位置；读到底部后清除记录（下次从头读）。
// 后退/前进（popstate）不干预，交给浏览器/swup 自己的滚动恢复。
// 模块只加载一次，通过 astro:page-load 覆盖 swup 软导航进入文章页的场景。

const STORAGE_PREFIX = "reading-pos:";
const MAX_AGE_MS: number = 30 * 24 * 3600 * 1000; // 记录保留 30 天
const MIN_SAVE_Y = 300; // 刚开头不记
const BOTTOM_GAP = 160; // 距底部不足 160px 视为已读完

function isPostPage(pathname: string): boolean {
	return /\/posts\/.+/.test(pathname);
}

function storageKey(path: string): string {
	return STORAGE_PREFIX + path;
}

// 惰性清理过期/损坏的记录
function prune(): void {
	const now = Date.now();
	try {
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const k = localStorage.key(i);
			if (!k?.startsWith(STORAGE_PREFIX)) continue;
			try {
				const v = JSON.parse(localStorage.getItem(k) || "null");
				if (!v || now - v.t > MAX_AGE_MS) localStorage.removeItem(k);
			} catch {
				localStorage.removeItem(k);
			}
		}
	} catch {}
}

function save(): void {
	const path = location.pathname;
	if (!isPostPage(path)) return;
	const y = Math.round(window.scrollY);
	const max = document.documentElement.scrollHeight - window.innerHeight;
	try {
		if (max - y <= BOTTOM_GAP) {
			// 已读到底，清除记录
			localStorage.removeItem(storageKey(path));
		} else if (y > MIN_SAVE_Y) {
			localStorage.setItem(storageKey(path), JSON.stringify({ y, t: Date.now() }));
		}
	} catch {}
}

function restore(): void {
	const path = location.pathname;
	if (!isPostPage(path)) return;
	let y = 0;
	try {
		const v = JSON.parse(localStorage.getItem(storageKey(path)) || "null");
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

// swup 软导航进入文章页
document.addEventListener("astro:page-load", () => {
	if (!skipNextRestore) restore();
});
