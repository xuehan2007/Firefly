/**
 * 自定义 Astro 图像服务：在官方 sharp 服务基础上做感知质量映射。
 *
 * 背景：AVIF 的质量刻度与 WebP/JPEG 不同。若直接把 WebP 的 q80 传给 AVIF，
 * 会产生码率冗余（体积反而比 WebP 大）。AVIF 在 q55-60 区间即可达到
 * WebP q80 的主观画质，体积约小 30%。
 *
 * 策略（仅调整 AVIF，其余格式沿用官方服务的原始参数）：
 * - AVIF quality: 输入质量 × 0.7（80→56, 82→57），并钳制在 40-63
 * - AVIF effort: 5（编码更精细，体积再小一点，构建时间增量很小）
 */
import sharpService from "astro/assets/services/sharp";

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
								config.service?.config?.avif?.effort ?? 5,
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
