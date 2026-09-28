import type { CoverImageConfig } from "../types/coverImageConfig";
import coverImageData from "../data/coverImage.json";

/**
 * 文章封面图配置（从 coverImage.json 读取，可通过后台管理编辑）
 */
export const coverImageConfig: CoverImageConfig =
	coverImageData as CoverImageConfig;
