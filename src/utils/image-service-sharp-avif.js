/**
 * 自定义 Astro 图像服务：在官方 sharp 服务基础上做感知质量映射。
 *
 * 背景：AVIF 的质量刻度与 WebP/JPEG 不同。若直接把 WebP 的 q80 传给 AVIF，
 * 会产生码率冗余（体积反而比 WebP 大）。AVIF 在 q55-60 区间即可达到
 * WebP q80 的主观画质，体积约小 30%。
 *
 * 策略（仅调整 AVIF，其余格式沿用官方服务的原始参数）：
 * - AVIF quality: 输入质量 × 0.7（80→56, 82→57），并钳制在 40-63
 * - AVIF effort: 本地构建用 5（编码更精细，体积再小一点）；
 *   CI（Vercel/CF Pages）上用 3——2 核构建机上 effort 5 每张 4K 图要 10 秒以上，
 *   900 张变体会打满 45 分钟构建时长上限；effort 3 快约 3~5 倍，体积仅增几个百分点
 */
import sharpService from "astro/assets/services/sharp";

const isCI = !!(
	process.env.VERCEL ||
	process.env.CF_PAGES ||
	process.env.EDGEONE_PROJECT_ID ||
	process.env.CI
);
const AVIF_EFFORT = isCI ? 3 : 5;

const service = {
	...sharpService,
	async transform(inputBuffer, transformOptions, config, logger) {
		let options = transformOptions;
		let serviceConfig = config;

		if (
			transformOptions.format === "avif" &&
			typeof transformOptions.quality === "number"
		) {
			const mappedQuality = Math.max(
				40,
				Math.min(63, Math.round(transformOptions.quality * 0.7)),
			);
			options = { ...transformOptions, quality: mappedQuality };
			serviceConfig = {
				...config,
				service: {
					...config.service,
					config: {
						...config.service?.config,
						avif: {
							...config.service?.config?.avif,
							effort:
									config.service?.config?.avif?.effort ??
									AVIF_EFFORT,
						},
					},
				},
			};
		}

		return sharpService.transform(
			inputBuffer,
			options,
			serviceConfig,
			logger,
		);
	},
};

export default service;
