import { backgroundWallpaper } from "../config";

export type BackgroundImages = {
	desktop: string[];
	mobile: string[];
	isMultiple: boolean;
};

// 将单个值或数组统一为数组
const toArray = (src: string | string[] | undefined): string[] => {
	if (!src) return [];
	if (Array.isArray(src)) return src;
	return [src];
};

// 过滤掉后台禁用列表中的壁纸（路径匹配）
const filterDisabled = (
	list: string[],
	kind: "desktop" | "mobile",
): string[] => {
	const disabled = backgroundWallpaper.disabled?.[kind];
	if (!disabled || disabled.length === 0) return list;
	return list.filter((p) => !disabled.includes(p));
};

// 背景图片处理工具函数
// 返回所有配置的图片（用于构建时渲染所有图片），已排除后台禁用项
export const getBackgroundImages = (): BackgroundImages => {
	const bgSrc = backgroundWallpaper.src;

	if (
		typeof bgSrc === "object" &&
		bgSrc !== null &&
		!Array.isArray(bgSrc) &&
		("desktop" in bgSrc || "mobile" in bgSrc)
	) {
		const srcObj = bgSrc as {
			desktop?: string | string[];
			mobile?: string | string[];
		};
		const rawDesktop = toArray(srcObj.desktop);
		const rawMobile = toArray(srcObj.mobile);
		// 互为 fallback 时，用另一档的原图补齐（再统一过滤，避免 fallback 带入已禁用项）
		const desktopImages = filterDisabled(
			rawDesktop.length > 0 ? rawDesktop : rawMobile,
			"desktop",
		);
		const mobileImages = filterDisabled(
			rawMobile.length > 0 ? rawMobile : rawDesktop,
			"mobile",
		);
		return {
			desktop: desktopImages,
			mobile: mobileImages,
			isMultiple: desktopImages.length > 1 || mobileImages.length > 1,
		};
	}
	// 如果是字符串或数组，同时用于桌面端和移动端（按 desktop 禁用列表过滤）
	const images = filterDisabled(toArray(bgSrc as string | string[]), "desktop");
	return {
		desktop: images,
		mobile: images,
		isMultiple: images.length > 1,
	};
};

// 类型守卫函数
export const isBannerSrcObject = (
	src:
		| string
		| string[]
		| { desktop?: string | string[]; mobile?: string | string[] },
): src is { desktop?: string | string[]; mobile?: string | string[] } => {
	return (
		typeof src === "object" &&
		src !== null &&
		!Array.isArray(src) &&
		("desktop" in src || "mobile" in src)
	);
};

// 获取默认背景图片（返回第一张，用于 SEO 等场景）
export const getDefaultBackground = (): string => {
	const images = getBackgroundImages();
	return images.desktop[0] || images.mobile[0] || "";
};

// 检查是否为首页
export const isHomePage = (pathname: string): boolean => {
	// 获取 base URL
	const baseUrl = import.meta.env.BASE_URL || "/";
	const baseUrlNoSlash = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

	if (pathname === baseUrl) return true;
	if (pathname === baseUrlNoSlash) return true;
	if (pathname === "/") return true;

	return false;
};

// 获取横幅偏移量
export const getBannerOffset = (position = "center"): string => {
	const bannerOffsetByPosition = {
		top: "100vh",
		center: "50vh",
		bottom: "0",
	};
	return (
		bannerOffsetByPosition[position as keyof typeof bannerOffsetByPosition] ||
		"50vh"
	);
};
