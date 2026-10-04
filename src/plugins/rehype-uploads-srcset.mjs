import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";

/**
 * 为引用 /uploads/ 图片的正文 <img> 自动补响应式 srcset：
 * 检测 public/uploads 下是否存在 generate-uploads-variants.ts 生成的
 * name-750/1080/1440.webp 变体，存在则写 srcset + sizes，
 * 并补 loading="lazy" / decoding="async"（不覆盖已有值）。
 * 同时覆盖两种图片来源：
 * - 标准 markdown 图片 ![]()（hast element 节点）
 * - markdown 里手写的原生 <img> 标签（hast raw 节点，按字符串注入属性）
 *
 * @returns {Function} rehype transformer
 */
const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");
const WIDTHS = [750, 1080, 1440];
// 移动端近全宽，桌面正文栏约 880px 上限
const SIZES = "(max-width: 768px) calc(100vw - 2.5rem), 880px";

function buildSrcset(base) {
	const srcset = [];
	for (const w of WIDTHS) {
		const file = `${base}-${w}.webp`;
		if (fs.existsSync(path.join(UPLOADS_DIR, file))) {
			srcset.push(`/uploads/${file} ${w}w`);
		}
	}
	return srcset;
}

export default function rehypeUploadsSrcset() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "img") return;
			const src = node.properties?.src;
			if (typeof src !== "string") return;

			const m = src.match(/^\/uploads\/(.+)\.(webp|png|jpe?g)$/i);
			if (!m) return;

			const srcset = buildSrcset(m[1]);
			if (srcset.length === 0) return;

			node.properties.srcset = srcset.join(", ");
			node.properties.sizes = SIZES;
			if (!node.properties.loading) node.properties.loading = "lazy";
			if (!node.properties.decoding) node.properties.decoding = "async";
		});

		visit(tree, "raw", (node) => {
			if (typeof node.value !== "string" || !node.value.includes("/uploads/"))
				return;
			node.value = node.value.replace(
				/<img\s+([^>]*?)src="(\/uploads\/(.+?)\.(?:webp|png|jpe?g))"([^>]*)>/gi,
				(whole, before, fullSrc, base, after) => {
					const attrs = before + after;
					if (/\bsrcset\s*=/.test(attrs)) return whole;
					const srcset = buildSrcset(base);
					if (srcset.length === 0) return whole;
					const inject = ` srcset="${srcset.join(", ")}" sizes="${SIZES}"`;
					const extra = /\bloading\s*=/.test(attrs)
						? ""
						: ' loading="lazy" decoding="async"';
					return `<img ${before}src="${fullSrc}"${inject}${extra}${after}>`;
				},
			);
		});
	};
}
