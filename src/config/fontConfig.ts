/**
 * 字体配置（统一入口）
 *
 * 所有字体相关配置都在此文件中定义：
 *   详细用法请参考 Astro 官方文档：https://docs.astro.build/en/guides/fonts
 * - fonts：Astro Font API 字体定义（自动下载、缓存、优化加载）
 * - fontConfig：字体选择与区域覆盖
 *
 * 添加新字体只需编辑本文件：
 * 1. 在下方 fonts 数组中添加字体定义
 * 2. 在 fontConfig.selected 或区域字段中引用对应的 cssVariable
 *
 * 支持的 provider：https://docs.astro.build/en/reference/font-provider-reference/#built-in-providers
 *   "google"     - Google Fonts
 *   "fontsource" - Fontsource
 *   "local"      - 本地字体文件
 *   "bunny"      - Bunny Fonts
 *   "fontshare"  - Fontshare
 *   "npm"        - NPM 包（如 @fontsource/*）
 *
 * 本地字体子集化：在 fontConfig.subsetFonts 中添加对应 cssVariable 的配置，
 * 构建时脚本会自动扫描页面字符并生成轻量 woff2 子集。
 */
import type { FontDefinition, FontSelectionConfig } from "@/types/fontConfig";
import fontSelectionData from "../data/font.json";

// ─── Astro Font API 字体定义 ───────────────────────────────
// 适用于 Astro Font API 的字体配置，支持自动下载、缓存和优化加载
// 本地开发调试的情况下，修改后需要每次重启开发服务器才能生效
export const fontsList: FontDefinition[] = [
	{
		name: "Zen Maru Gothic",
		cssVariable: "--font-zen-maru-gothic",
		provider: "fontsource",
		weights: ["300", "400", "500", "600", "700"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: ["sans-serif"],
	},
	{
		name: "Inter",
		cssVariable: "--font-inter",
		provider: "fontsource",
		weights: ["300", "400", "500", "600", "700"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: ["sans-serif"],
	},
	{
		name: "JetBrains Mono",
		cssVariable: "--font-jetbrains-mono",
		provider: "fontsource",
		weights: ["400", "700"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: [
			"ui-monospace",
			"SFMono-Regular",
			"Menlo",
			"Monaco",
			"Consolas",
			"Liberation Mono",
			"Courier New",
			"monospace",
		],
	},
	{
		name: "LXGW WenKai",
		cssVariable: "--font-lxgw-wenkai",
		provider: "fontsource",
		weights: ["500"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: [
			"system-ui",
			"-apple-system",
			"BlinkMacSystemFont",
			"'Segoe UI'",
			"'Microsoft YaHei'",
			"sans-serif",
		],
	},
	// ─── 本地字体示例 ───
	// 使用步骤：
	// 1. 将 TTF/OTF/WOFF2 字体文件放在 public/assets/fonts/ 目录下
	// 2. 参考下方配置填写正确的字体信息
	// 3. 在 fontConfig.selected 或区域字段中引用 cssVariable
	{
		name: "GreatVibes Regular 2",
		cssVariable: "--font-greatvibes",
		provider: "local",
		options: {
			variants: [
				{
					src: ["./public/assets/fonts/GreatVibes-Regular-2.otf"],
				},
			],
		},
		fallbacks: ["sans-serif"],
	},
];

// ─── 字体选择与区域覆盖 ─────────────────────────────────────
// 从 font.json 读取，可通过后台管理编辑
export const fontConfig: FontSelectionConfig =
	fontSelectionData as FontSelectionConfig;
