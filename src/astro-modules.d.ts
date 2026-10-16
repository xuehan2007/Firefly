// 让 .ts barrel（如 firefly-mdx.ts）能 re-export `.astro` 组件。
//
// 背景：纯 tsc 不把 `.astro` 当源文件解析，`.ts` 里 `import ... from "./X.astro"`
// 会报 "Cannot find module"。编辑器/`astro check` 走 @astrojs/ts-plugin，能拿到
// 真实类型；这里只是给 `pnpm type-check`（纯 tsc）兜底，不影响实际渲染。
declare module "*.astro" {
	import type { AstroComponentFactory } from "astro/runtime/server/index.js";

	const component: AstroComponentFactory;
	export default component;
}

// gifenc 未提供类型声明（只有 ESM 产物），这里补一份最小可用的
declare module "gifenc" {
	export interface GifFrameOptions {
		palette?: number[][];
		transparent?: boolean;
		transparentIndex?: number;
		/** 帧延迟，单位毫秒 */
		delay?: number;
		repeat?: number;
		colorDepth?: number;
		dispose?: number;
	}

	export interface GifEncoderInstance {
		writeFrame(
			index: Uint8Array,
			width: number,
			height: number,
			opts?: GifFrameOptions,
		): void;
		finish(): void;
		bytes(): Uint8Array;
		bytesView(): Uint8Array;
		reset(): void;
	}

	export function GIFEncoder(opts?: {
		auto?: boolean;
		initialCapacity?: number;
	}): GifEncoderInstance;

	export function quantize(
		rgba: Uint8Array | Uint8ClampedArray,
		maxColors: number,
		opts?: {
			format?: "rgb565" | "rgb444" | "rgba4444";
			oneBitAlpha?: boolean | number;
			clearAlpha?: boolean;
			clearAlphaThreshold?: number;
			clearAlphaColor?: number;
		},
	): number[][];

	export function applyPalette(
		rgba: Uint8Array | Uint8ClampedArray,
		palette: number[][],
		format?: "rgb565" | "rgb444" | "rgba4444",
	): Uint8Array;
}
