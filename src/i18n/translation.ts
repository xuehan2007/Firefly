import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { en } from "./languages/en";
import { zh_CN } from "./languages/zh_CN";

// 性能说明：站点为「构建时单语」（语言由 site.json 或 PUBLIC_SITE_LANG 在构建期固定）。
// 这里只静态打包「英文兜底 + 当前语言 zh_CN」，避免 ja/ko/ru/zh_TW 等其余语言
// （约 90KB 源码）全部进入客户端 bundle。其余语言文件仍保留在 ./languages/ 下。
// 将来需要重新启用某语言（例如站点改以日文构建）时，只需两步：
//   1) 顶部 import 对应语言：  import { ja } from "./languages/ja";
//   2) 在下方 map 注册其语言代码：  ja: ja, ja_jp: ja,
// 重新构建即会自动把该语言打进 bundle。

export type Translation = {
	[K in I18nKey]: string;
};

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
	en: en,
	en_us: en,
	en_gb: en,
	en_au: en,
	zh_cn: zh_CN,
};

export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
	const lang = siteConfig.lang || "en";
	const currentLang = getTranslation(lang);
	const value = currentLang[key];

	// 如果当前语言没有翻译（或为空），则使用中文作为备选
	if (!value && lang.toLowerCase() !== "zh_cn") {
		const chineseValue = zh_CN[key];
		if (chineseValue) {
			return chineseValue;
		}
	}

	return value || defaultTranslation[key];
}
