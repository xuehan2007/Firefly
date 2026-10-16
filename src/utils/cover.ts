// 外链封面统一走本站同源代理 (/api/img/proxy)，
// 避免国内手机直连第三方图床（lain.bgm.tv 等）加载失败。
// 传 w 让代理返回指定宽度的缩略图，手机不再下载原图。
//
// 历史上漫画/番剧列表页、详情页、后台各写了一份相同逻辑，统一收敛到这里。

export function proxyCoverUrl(url?: string, w?: number): string {
	if (!url || !/^https?:\/\//i.test(url)) return url || "";
	return `/api/img/proxy?url=${encodeURIComponent(url)}${w ? `&w=${w}` : ""}`;
}
