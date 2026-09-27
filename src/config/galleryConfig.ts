import type { GalleryConfig } from "@/types/galleryConfig";
import galleryData from "../data/gallery.json";

// 相册配置
export const galleryConfig: GalleryConfig = {
	// 相册列表（数据来自 src/data/gallery.json，可在后台管理）
	albums: galleryData as GalleryConfig["albums"],

	// 瀑布流最小列宽(px)，浏览器根据容器宽度自动计算列数，默认 240
	// 值越小列数越多，值越大列数越少
	columnWidth: 240,
};
