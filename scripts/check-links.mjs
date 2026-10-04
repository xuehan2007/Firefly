/**
 * 文章图片断链检查（非破坏性）
 *
 * 检查范围：
 *  - 所有文章 frontmatter 的 image 字段（封面）
 *  - 正文 Markdown 图片 ![alt](path)
 *  - 正文 HTML <img src="path">（含 frontmatter 里夹带引号之类的脏数据）
 *
 * 判定规则（与 scripts/quarantine-bad-posts.mjs 保持一致）：
 *  - / 开头的绝对站点路径 -> public/ 下查找
 *  - 相对路径 -> 相对文章所在目录
 *  - 本地缺失 = 错误（退出码 1），因为构建后必然 404
 *  - 外链（http/https/协议相对）默认也探测，失败只警告不阻断（对方站点可能临时波动）
 *
 * 用法：
 *   node scripts/check-links.mjs            # 本地 + 外链都查
 *   node scripts/check-links.mjs --offline  # 只查本地文件，不发网络请求
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = "src/content/posts";
const OFFLINE = process.argv.includes("--offline");
const CONCURRENCY = 6;
const TIMEOUT_MS = 8000;

// 图床/防盗链站点对 HEAD 可能直接拒绝，探测失败后用 GET 兜底
async function checkRemote(url) {
	const tryOne = async (method) => {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
		try {
			const res = await fetch(url, {
				method,
				redirect: "follow",
				signal: controller.signal,
			});
			return res.status;
		} finally {
			clearTimeout(timer);
		}
	};

	let status = await tryOne("HEAD");
	if (status === 403 || status === 405 || status === undefined) {
		status = await tryOne("GET");
	}
	return status;
}

function isExternalUrl(url) {
	return /^(https?:\/\/|\/\/)/i.test(url.trim());
}

// 去掉链接里的查询串和锚点（图片可能带 ?v=2 之类）
function stripQuery(url) {
	return url.trim().split(/[?#]/)[0];
}

// 剥掉代码块，避免示例代码里的标签被当成真实引用
function stripCode(md) {
	return md
		.replace(/```[\s\S]*?```/g, "")
		.replace(/~~~[\s\S]*?~~~/g, "")
		.replace(/`[^`\n]+`/g, "");
}

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir).flatMap((f) => {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) {
			return f === "_quarantine" ? [] : walk(p);
		}
		return /\.mdx?$/.test(f) ? [p] : [];
	});
}

// 收集一篇文章里的全部图片引用：{ url, where }
function collectRefs(file) {
	const refs = [];
	const raw = fs.readFileSync(file, "utf8");
	let parsed;
	try {
		parsed = matter(raw);
	} catch (err) {
		return { parseError: err.message, refs };
	}

	const { data, content } = parsed;

	if (typeof data.image === "string" && data.image !== "api" && data.image) {
		refs.push({ url: data.image, where: "frontmatter.image(封面)" });
	}

	const body = stripCode(content);
	for (const m of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
		refs.push({ url: m[1], where: "正文 Markdown" });
	}
	for (const m of body.matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi)) {
		refs.push({ url: m[1], where: "正文 HTML <img>" });
	}

	return { parseError: null, refs };
}

async function main() {
	const files = walk(POSTS_DIR);
	const errors = []; // { file, url, where, reason }
	const warnings = [];
	const remoteJobs = [];

	for (const file of files) {
		const { parseError, refs } = collectRefs(file);
		if (parseError) {
			errors.push({
				file,
				url: "-",
				where: "frontmatter",
				reason: `YAML 解析失败: ${parseError}`,
			});
			continue;
		}

		const seen = new Set();
		for (const ref of refs) {
			const key = `${ref.where}|${ref.url}`;
			if (seen.has(key)) continue;
			seen.add(key);

			const url = ref.url.trim();
			if (isExternalUrl(url)) {
				if (!OFFLINE) remoteJobs.push({ file, ...ref });
				continue;
			}

			const clean = stripQuery(url);
			// 本地路径：引号/空白等脏字符也直接判错（线上就是这类问题导致 404）
			if (/["'<>`]/.test(clean) || clean !== clean.trim()) {
				errors.push({
					file,
					...ref,
					reason: "路径含有非法字符（引号/空白等）",
				});
				continue;
			}

			const abs = clean.startsWith("/")
				? path.join("public", clean)
				: path.resolve(path.dirname(file), clean);

			if (!fs.existsSync(abs)) {
				errors.push({ file, ...ref, reason: `本地文件不存在: ${abs}` });
			}
		}
	}

	// 并发受限地探测外链
	if (remoteJobs.length > 0) {
		let cursor = 0;
		const worker = async () => {
			while (cursor < remoteJobs.length) {
				const job = remoteJobs[cursor++];
				try {
					const status = await checkRemote(job.url);
					if (status >= 400) {
						warnings.push({ ...job, reason: `外链返回 HTTP ${status}` });
					}
				} catch (err) {
					warnings.push({
						...job,
						reason: `外链请求失败: ${err.name === "AbortError" ? "超时" : err.message}`,
					});
				}
			}
		};
		await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	}

	const rel = (p) => path.relative(".", p).replaceAll("\\", "/");
	for (const e of errors) {
		console.log(
			`✗ [错误] ${rel(e.file)}\n    ${e.where} -> ${e.url}\n    ${e.reason}`,
		);
	}
	for (const w of warnings) {
		console.log(
			`⚠ [警告] ${rel(w.file)}\n    ${w.where} -> ${w.url}\n    ${w.reason}`,
		);
	}

	console.log(
		`\n扫描 ${files.length} 篇文章，${errors.length} 个错误，${warnings.length} 个外链警告` +
			(OFFLINE ? "（离线模式，未检查外链）" : ""),
	);

	if (errors.length > 0) {
		console.log("\n本地图片缺失会导致线上 404，请修复后再发布。");
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
