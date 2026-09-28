import type { Live2DWidgetConfig, SpineModelConfig } from "../types/pioConfig";
import pioData from "../data/pio.json";

// 看板娘配置（从 pio.json 读取，可通过后台管理编辑）
export const spineModelConfig: SpineModelConfig =
	pioData.spine as SpineModelConfig;

export const live2dWidgetConfig: Live2DWidgetConfig =
	pioData.live2d as Live2DWidgetConfig;
