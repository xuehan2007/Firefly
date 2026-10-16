/**
 * GIF 工具（浏览器端）：静态首帧提取 + 超限自动压缩重编码。
 *
 * 依赖两个纯 JS 库：
 * - gifuct-js：解析 GIF 结构、LZW 解压出每帧 RGBA patch
 * - gifenc：把 RGBA 重新量化、编码回 GIF
 *
 * 使用场景：后台相册上传时，超过服务器请求体上限的动图在浏览器里自动
 * 降分辨率 / 抽帧 / 减色重编码，无需用户手动处理；后台照片网格用静态
 * 首帧 + GIF 角标展示，点击才播放。
 */
import {
	type ParsedFrame,
	type ParsedGif,
	decompressFrame,
	decompressFrames,
	parseGIF,
} from "gifuct-js";
import { GIFEncoder, applyPalette, quantize } from "gifenc";

/** 服务器请求体上限（Vercel 约 4.5MB），留出 multipart 表单余量 */
export const GIF_UPLOAD_LIMIT = 4.2 * 1024 * 1024;

export interface GifCompressResult {
	/** 可直接上传的文件；无需压缩时就是原文件 */
	file: File;
	/** 是否真的重新编码过 */
	compressed: boolean;
	originalSize: number;
	size: number;
	width: number;
	height: number;
	frames: number;
}

export interface GifCompressOptions {
	/** 允许的最大字节数，默认 GIF_UPLOAD_LIMIT */
	maxBytes?: number;
	/** 进度回调，参数 0~1 */
	onProgress?: (ratio: number) => void;
}

interface Plan {
	maxDim: number;
	colors: number;
	step: number;
}

interface PaletteInfo {
	palette: number[][];
	transparentIndex: number;
}

/** 取出 GIF 里第一个可解码的画面（只解这一帧，不做整图解码） */
function firstImageFrame(gif: ParsedGif): ParsedFrame {
	const frame = gif.frames.find((f) => "image" in f);
	if (!frame) throw new Error("GIF 中没有可解码的画面");
	return decompressFrame(frame as never, gif.gct, true);
}

/**
 * 把一帧的 patch 合成到完整画布上：patch 的坐标由 dims 决定，
 * alpha 为 0 的像素（原图透明色）不覆盖已有内容。
 */
function drawPatch(
	canvas: Uint8ClampedArray,
	canvasW: number,
	canvasH: number,
	frame: ParsedFrame,
): void {
	const { left, top, width: fw, height: fh } = frame.dims;
	const patch = frame.patch;
	for (let y = 0; y < fh; y++) {
		const cy = top + y;
		if (cy < 0 || cy >= canvasH) continue;
		for (let x = 0; x < fw; x++) {
			const cx = left + x;
			if (cx < 0 || cx >= canvasW) continue;
			const s = (y * fw + x) * 4;
			if (patch[s + 3] === 0) continue;
			const d = (cy * canvasW + cx) * 4;
			canvas[d] = patch[s];
			canvas[d + 1] = patch[s + 1];
			canvas[d + 2] = patch[s + 2];
			canvas[d + 3] = 255;
		}
	}
}

/** 按 disposal=2（还原背景）清除本帧覆盖的区域 */
function clearPatchArea(
	canvas: Uint8ClampedArray,
	canvasW: number,
	canvasH: number,
	frame: ParsedFrame,
): void {
	const { left, top, width: fw, height: fh } = frame.dims;
	for (let y = 0; y < fh; y++) {
		const cy = top + y;
		if (cy < 0 || cy >= canvasH) continue;
		for (let x = 0; x < fw; x++) {
			const cx = left + x;
			if (cx < 0 || cx >= canvasW) continue;
			const d = (cy * canvasW + cx) * 4;
			canvas[d] = 0;
			canvas[d + 1] = 0;
			canvas[d + 2] = 0;
			canvas[d + 3] = 0;
		}
	}
}

/**
 * 逐帧合成并输出完整画布。
 * 抽帧（step>1）时仍会处理被跳过的帧的 disposal，只把若干帧的延迟累加到
 * 输出帧上，保证动画节奏基本不变。
 */
function* compositeFrames(
	frames: ParsedFrame[],
	width: number,
	height: number,
	step: number,
): Generator<{ rgba: Uint8ClampedArray; delay: number }> {
	const canvas = new Uint8ClampedArray(width * height * 4);
	let saved: Uint8ClampedArray | null = null;
	let pending: Uint8ClampedArray | null = null;
	let pendingDelay = 0;

	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		if (frame.disposalType === 3) saved = canvas.slice();

		drawPatch(canvas, width, height, frame);

		const delay = Math.max(20, frame.delay || 100);
		if (pending) pendingDelay += delay;
		else {
			pending = canvas.slice();
			pendingDelay = delay;
		}

		if (frame.disposalType === 2) {
			clearPatchArea(canvas, width, height, frame);
		} else if (frame.disposalType === 3 && saved) {
			canvas.set(saved);
		}

		if (i === frames.length - 1 || i % step === step - 1) {
			yield { rgba: pending as Uint8ClampedArray, delay: pendingDelay };
			pending = null;
			pendingDelay = 0;
		}
	}
}

/** 复用同一组 canvas 做缩放，避免每帧新建 */
function createScaler(): (
	rgba: Uint8ClampedArray,
	sw: number,
	sh: number,
	dw: number,
	dh: number,
) => Uint8ClampedArray {
	const src = document.createElement("canvas");
	const dst = document.createElement("canvas");
	const sctx = src.getContext("2d");
	const dctx = dst.getContext("2d");
	if (!sctx || !dctx) throw new Error("当前浏览器不支持 Canvas 2D");
	return (rgba: Uint8ClampedArray, sw: number, sh: number, dw: number, dh: number) => {
		if (sw === dw && sh === dh) return rgba;
		src.width = sw;
		src.height = sh;
		sctx.putImageData(new ImageData(rgba, sw, sh), 0, 0);
		dst.width = dw;
		dst.height = dh;
		dctx.imageSmoothingEnabled = true;
		dctx.imageSmoothingQuality = "high";
		dctx.drawImage(src, 0, 0, sw, sh, 0, 0, dw, dh);
		return dctx.getImageData(0, 0, dw, dh).data;
	};
}

/** 从帧像素里抽样，用于没有全局调色板时重新量化 */
function collectSamples(frames: ParsedFrame[], maxSamples: number): {
	data: Uint8ClampedArray;
	hasAlpha: boolean;
} {
	const perFrame = Math.max(1, Math.floor(maxSamples / Math.max(1, frames.length)));
	const chunks: Uint8ClampedArray[] = [];
	let hasAlpha = false;
	for (const frame of frames) {
		const total = frame.dims.width * frame.dims.height;
		if (!total) continue;
		const stride = Math.max(1, Math.floor(total / perFrame));
		const count = Math.floor(total / stride);
		const out = new Uint8ClampedArray(count * 4);
		const patch = frame.patch;
		let o = 0;
		for (let i = 0; i < count; i++) {
			const p = i * stride * 4;
			out[o] = patch[p];
			out[o + 1] = patch[p + 1];
			out[o + 2] = patch[p + 2];
			out[o + 3] = patch[p + 3];
			if (patch[p + 3] === 0) hasAlpha = true;
			o += 4;
		}
		chunks.push(out);
	}
	const merged = new Uint8ClampedArray(chunks.reduce((n, c) => n + c.length, 0));
	let offset = 0;
	for (const c of chunks) {
		merged.set(c, offset);
		offset += c.length;
	}
	return { data: merged, hasAlpha };
}

/** 归一化成 RGBA 四元组，保证 applyPalette 的距离计算可用 */
function normalizePalette(raw: number[][]): number[][] {
	return raw.map((c) => [c[0], c[1], c[2], c.length > 3 ? c[3] : 255]);
}

/**
 * 取全局调色板：优先直接复用原 GIF 的全局色表（零成本且颜色忠实），
 * 没有全局色表时才从帧像素抽样重新量化。
 */
function buildPalette(
	gif: ParsedGif,
	frames: ParsedFrame[],
	colors: number,
): PaletteInfo {
	const gct = gif.gct;
	if (gct && gct.length) {
		const palette = gct.map((c) => [c[0], c[1], c[2], 255]);
		for (const frame of frames) {
			const t = frame.transparentIndex;
			if (typeof t === "number" && t >= 0 && t < palette.length) {
				palette[t] = [palette[t][0], palette[t][1], palette[t][2], 0];
				return { palette, transparentIndex: t };
			}
		}
		return { palette, transparentIndex: -1 };
	}

	const { data, hasAlpha } = collectSamples(frames, 120000);
	const palette = normalizePalette(
		quantize(data, Math.max(2, Math.min(colors, 256)), {
			format: "rgba4444",
			oneBitAlpha: true,
		}),
	);
	if (!hasAlpha) return { palette, transparentIndex: -1 };

	let t = palette.findIndex((c) => c[3] === 0);
	if (t < 0) {
		if (palette.length < 256) {
			palette.push([0, 0, 0, 0]);
		} else {
			palette[palette.length - 1] = [0, 0, 0, 0];
		}
		t = palette.length - 1;
	}
	return { palette, transparentIndex: t };
}

/** colorDepth 用 2^n 表示色表大小，写进 GIF 的 LZW 最小码长 */
function colorDepthOf(size: number): number {
	return Math.max(1, Math.min(8, Math.ceil(Math.log2(Math.max(2, size)))));
}

/** 按一个档位重新编码，返回 GIF 字节 */
async function encodeWithPlan(
	frames: ParsedFrame[],
	srcW: number,
	srcH: number,
	plan: Plan,
	paletteInfo: PaletteInfo,
	onProgress?: (ratio: number) => void,
): Promise<Uint8Array> {
	const scale = Math.min(1, plan.maxDim / Math.max(srcW, srcH));
	const tw = Math.max(1, Math.round(srcW * scale));
	const th = Math.max(1, Math.round(srcH * scale));
	const scaleRgba = createScaler();
	const encoder = GIFEncoder();
	const { palette, transparentIndex } = paletteInfo;
	const frameOpts: Record<string, unknown> =
		transparentIndex >= 0 ? { transparent: true, transparentIndex } : {};

	// 与 compositeFrames 的输出节奏一致：每 step 帧输出一次，末帧必定输出
	const total =
		Math.floor(frames.length / plan.step) +
		((frames.length - 1) % plan.step === plan.step - 1 ? 0 : 1);
	let written = 0;
	let first = true;
	for (const { rgba, delay } of compositeFrames(frames, srcW, srcH, plan.step)) {
		const scaled = scaleRgba(rgba, srcW, srcH, tw, th);
		const index = applyPalette(scaled, palette, "rgba4444");
		encoder.writeFrame(index, tw, th, {
			...frameOpts,
			delay,
			// 全局色表只需要在第一帧写入，后续帧共用，省掉每帧的局部色表
			colorDepth: colorDepthOf(palette.length),
			...(first ? { palette } : {}),
		});
		first = false;
		written++;
		if (onProgress) onProgress(written / Math.max(1, total));
		// 每处理若干帧让出主线程，保证进度条能刷新
		if (written % 8 === 0) await new Promise((r) => setTimeout(r, 0));
	}
	encoder.finish();
	return encoder.bytes();
}

/** 按需逐级降低画质，返回第一个能压进限额的结果 */
function buildPlans(maxDim: number, frameCount: number): Plan[] {
	const startStep = frameCount > 600 ? 3 : frameCount > 300 ? 2 : 1;
	const raw: Plan[] = [
		{ maxDim: Math.min(1280, maxDim), colors: 256, step: startStep },
		{ maxDim: Math.min(960, maxDim), colors: 256, step: startStep },
		{ maxDim: Math.min(720, maxDim), colors: 192, step: Math.max(startStep, 2) },
		{ maxDim: Math.min(560, maxDim), colors: 128, step: Math.max(startStep, 2) },
		{ maxDim: Math.min(420, maxDim), colors: 96, step: Math.max(startStep, 3) },
		{ maxDim: Math.min(320, maxDim), colors: 64, step: Math.max(startStep, 4) },
	];
	const seen = new Set<string>();
	return raw.filter((p) => {
		const key = `${p.maxDim}|${p.colors}|${p.step}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/**
 * 超过 maxBytes 时自动压缩 GIF：依次尝试降分辨率、减色、抽帧，
 * 直到体积达标；已经够小则原样返回，不做任何重编码。
 */
export async function compressGif(
	file: File,
	options: GifCompressOptions = {},
): Promise<GifCompressResult> {
	const maxBytes = options.maxBytes ?? GIF_UPLOAD_LIMIT;
	const base: GifCompressResult = {
		file,
		compressed: false,
		originalSize: file.size,
		size: file.size,
		width: 0,
		height: 0,
		frames: 0,
	};
	if (file.size <= maxBytes) return base;

	const gif = parseGIF(await file.arrayBuffer());
	const frames = decompressFrames(gif, true);
	if (!frames.length) return base;
	const srcW = gif.lsd.width;
	const srcH = gif.lsd.height;

	const plans = buildPlans(Math.max(srcW, srcH), frames.length);
	let best: { bytes: Uint8Array; width: number; height: number } | null = null;

	for (const plan of plans) {
		const paletteInfo = buildPalette(gif, frames, plan.colors);
		const bytes = await encodeWithPlan(
			frames,
			srcW,
			srcH,
			plan,
			paletteInfo,
			options.onProgress,
		);
		const scale = Math.min(1, plan.maxDim / Math.max(srcW, srcH));
		const width = Math.max(1, Math.round(srcW * scale));
		const height = Math.max(1, Math.round(srcH * scale));
		if (!best || bytes.length < best.bytes.length) best = { bytes, width, height };
		if (bytes.length <= maxBytes) break;
	}

	if (!best) return base;
	const out = new File([best.bytes as unknown as BlobPart], file.name, {
		type: "image/gif",
	});
	return {
		file: out,
		compressed: true,
		originalSize: file.size,
		size: out.size,
		width: best.width,
		height: best.height,
		frames: frames.length,
	};
}

/**
 * 取 GIF 第一帧作为静态图（webp dataURL，浏览器不支持时自动退回 png）。
 * 只解码第一帧，适合后台网格里批量生成缩略图。
 */
export async function gifFirstFrame(
	source: Blob | ArrayBuffer,
	maxDim = 640,
): Promise<string> {
	const buffer = source instanceof Blob ? await source.arrayBuffer() : source;
	const gif = parseGIF(buffer);
	const frame = firstImageFrame(gif);
	const width = gif.lsd.width;
	const height = gif.lsd.height;

	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(maxDim));
	canvas.height = Math.max(1, Math.round((maxDim * height) / width));
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("当前浏览器不支持 Canvas 2D");
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";

	// 先把首帧画到原始尺寸的离屏画布，再缩放到目标尺寸
	const full = document.createElement("canvas");
	full.width = width;
	full.height = height;
	const fctx = full.getContext("2d");
	if (!fctx) throw new Error("当前浏览器不支持 Canvas 2D");
	const imageData = fctx.createImageData(width, height);
	const { left, top, width: fw, height: fh } = frame.dims;
	for (let y = 0; y < fh; y++) {
		const cy = top + y;
		if (cy < 0 || cy >= height) continue;
		for (let x = 0; x < fw; x++) {
			const cx = left + x;
			if (cx < 0 || cx >= width) continue;
			const s = (y * fw + x) * 4;
			if (frame.patch[s + 3] === 0) continue;
			const d = (cy * width + cx) * 4;
			imageData.data[d] = frame.patch[s];
			imageData.data[d + 1] = frame.patch[s + 1];
			imageData.data[d + 2] = frame.patch[s + 2];
			imageData.data[d + 3] = 255;
		}
	}
	fctx.putImageData(imageData, 0, 0);
	ctx.drawImage(full, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL("image/webp", 0.82);
}

/** 判断文件是不是 GIF（按 MIME 或扩展名，手机分享来的文件 MIME 常常是空的） */
export function isGifFile(file: File): boolean {
	return /gif/i.test(file.type) || /\.gif$/i.test(file.name);
}
