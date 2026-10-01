import { SKIP, visit } from "unist-util-visit";

/**
 * 图片前后对比滑块的 Remark 插件。
 *
 * 依赖 remark-directive，在文章里用容器指令：
 *
 *   :::compare
 *   ![旧版](/uploads/before.jpg)
 *   ![新版](/uploads/after.jpg)
 *   :::
 *
 * 第一张图 = Before（上层裁切），第二张图 = After（底层全图）。
 * 图片的 alt 文本会自动成为左右角标签。
 *
 * 生成的结构：
 *   figure.ba-compare
 *     img（after 底图，决定容器高度）
 *     .ba-compare__before（before 图层，clip-path 裁切）
 *       img
 *     .ba-compare__handle（分割线 + 圆形手柄）
 *     .ba-compare__label--before / --after
 *
 * @returns {import('unified').Plugin}
 */
export function remarkCompareImages() {
	return (tree) => {
		visit(tree, "containerDirective", (node) => {
			if (node.name !== "compare") return;

			const images = [];
			visit(node, "image", (img) => {
				images.push(img);
			});
			// 不足两张图无法对比，保持原样
			if (images.length < 2) return;

			const before = images[0];
			const after = images[1];

			/** 构造一个 hName 为指定标签的包装节点 */
			const wrapper = (hName, className, children, extraProps = {}) => ({
				type: "paragraph",
				data: {
					hName,
					hProperties: { className, ...extraProps },
				},
				children,
			});

			const labelNode = (text, placement) =>
				wrapper("span", ["ba-compare__label", `ba-compare__label--${placement}`], [
					{ type: "text", value: text },
				]);

			// 重建子节点，新节点不携带原段落引用
			const newChildren = [
				{ ...after },
				wrapper("div", ["ba-compare__before"], [{ ...before }]),
				wrapper(
					"div",
					["ba-compare__handle"],
					[{ type: "text", value: "" }],
					{ ariaHidden: "true" },
				),
			];
			if (before.alt) newChildren.push(labelNode(before.alt, "before"));
			if (after.alt) newChildren.push(labelNode(after.alt, "after"));

			node.children = newChildren;
			node.data = node.data ?? {};
			node.data.hName = "figure";
			node.data.hProperties = {
				className: ["ba-compare"],
				tabIndex: 0,
			};

			// 已重建子树，阻止 visit 继续进入新旧节点造成重复处理
			return SKIP;
		});
	};
}
