import { visit } from "unist-util-visit";

/**
 * Custom Remark plugin: turn a standalone video link into a responsive embed.
 *
 * When a paragraph contains nothing but a single video URL (bare URL or a
 * markdown auto-link whose text equals the URL), the paragraph is replaced
 * with raw HTML that renders a 16:9 video player:
 *
 *   YouTube:
 *     https://www.youtube.com/watch?v=5gIf0_xpFPI
 *     https://youtu.be/5gIf0_xpFPI
 *     https://www.youtube.com/embed/5gIf0_xpFPI
 *
 *   Bilibili:
 *     https://www.bilibili.com/video/BV1fK4y1s7Qf
 *     https://www.bilibili.com/video/BV1fK4y1s7Qf/?p=2
 *     https://b23.tv/BV1fK4y1s7Qf
 *
 *   Direct video files:
 *     https://example.com/demo.mp4   (also .webm / .ogv / .mov)
 *
 * Links wrapped in other text (e.g. `click [here](url)`) stay regular links.
 *
 * @returns {import('unified').Plugin}
 */

const YOUTUBE_WATCH =
	/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#]*?[?&])?v=([A-Za-z0-9_-]{11})(?:[&#].*)?$/i;
const YOUTUBE_SHORT =
	/^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/i;
const YOUTUBE_EMBED =
	/^https?:\/\/(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/i;

const BILIBILI_VIDEO =
	/^https?:\/\/(?:www\.|m\.)?bilibili\.com\/video\/(BV[A-Za-z0-9]+)\/?(?:\?([^#]*))?(?:#.*)?$/i;
const BILIBILI_SHORT =
	/^https?:\/\/b23\.tv\/(BV[A-Za-z0-9]+)(?:[?#].*)?$/i;

const DIRECT_VIDEO = /\.(mp4|webm|ogv|mov)(?:[?#].*)?$/i;

/** Read the `p` (page/part) parameter from a bilibili query string. */
function getBilibiliPage(query) {
	if (!query) return 1;
	const match = /(?:^|&)p=(\d+)/.exec(query);
	return match && match[1] ? match[1] : 1;
}

/** Build embed HTML for a recognized video URL, or null if unsupported. */
function buildEmbedHtml(rawUrl) {
	const url = rawUrl.trim();

	let match =
		url.match(YOUTUBE_WATCH) ||
		url.match(YOUTUBE_SHORT) ||
		url.match(YOUTUBE_EMBED);
	if (match) {
		const id = match[1];
		return (
			'<div class="video-embed">' +
			'<iframe loading="lazy" src="https://www.youtube.com/embed/' +
			id +
			'" title="YouTube video player" allow="accelerometer; autoplay; ' +
			"clipboard-write; encrypted-media; gyroscope; picture-in-picture; " +
			'web-share" allowfullscreen></iframe></div>'
		);
	}

	match = url.match(BILIBILI_VIDEO);
	if (match) {
		const bvid = match[1];
		const page = getBilibiliPage(match[2]);
		return (
			'<div class="video-embed">' +
			'<iframe loading="lazy" src="https://player.bilibili.com/player.html' +
			"?bvid=" +
			bvid +
			"&page=" +
			page +
			'&autoplay=0" title="Bilibili video player" scrolling="no" ' +
			"allowfullscreen></iframe></div>"
		);
	}

	match = url.match(BILIBILI_SHORT);
	if (match) {
		const bvid = match[1];
		return (
			'<div class="video-embed">' +
			'<iframe loading="lazy" src="https://player.bilibili.com/player.html' +
			"?bvid=" +
			bvid +
			'&autoplay=0" title="Bilibili video player" scrolling="no" ' +
			"allowfullscreen></iframe></div>"
		);
	}

	if (DIRECT_VIDEO.test(url)) {
		return (
			'<div class="video-embed"><video controls preload="metadata" src="' +
			url +
			'"></video></div>'
		);
	}

	return null;
}

/**
 * Extract the single video URL contained in a paragraph, if any.
 * Accepts a lone text node (bare URL) or a lone link node whose label
 * text is identical to its URL (auto-link style).
 */
function getParagraphVideoUrl(node) {
	const meaningful = (node.children || []).filter(
		(child) => !(child.type === "text" && child.value.trim() === ""),
	);
	if (meaningful.length !== 1) return null;

	const only = meaningful[0];

	if (only.type === "text") {
		return only.value.trim();
	}

	if (only.type === "link" && only.url) {
		const label = (only.children || [])
			.filter(
				(child) => !(child.type === "text" && child.value.trim() === ""),
			)
			.map((child) => (child.type === "text" ? child.value : ""))
			.join("")
			.trim();
		// Only treat as auto-link when the label is the URL itself, so that
		// `[watch this](url)` keeps rendering as a regular link.
		if (label === only.url.trim()) {
			return only.url.trim();
		}
	}

	return null;
}

export function remarkEmbedVideo() {
	return (tree) => {
		visit(tree, "paragraph", (node, index, parent) => {
			const url = getParagraphVideoUrl(node);
			if (!url) return;
			const html = buildEmbedHtml(url);
			if (!html) return;

			// Replace the whole paragraph with a raw HTML block node.
			if (parent && typeof index === "number") {
				parent.children[index] = { type: "html", value: html };
			} else {
				node.type = "html";
				node.value = html;
				delete node.children;
			}
		});
	};
}
