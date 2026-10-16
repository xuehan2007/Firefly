/**
 * astro check 基线检查（独立命令，刻意不接入 pnpm build）。
 *
 * 仓库里有数百个历史遗留类型错误，短期修不完；但新代码不应继续制造错误。
 * 本脚本程序化调用 @astrojs/language-server（即 astro check 的底层），
 * 把当前全部 error 按「相对路径:行:列:诊断码」记入 baseline：
 *
 *   pnpm check:baseline              对照基线，只有“新增”错误才失败（exit 1）
 *   pnpm check:baseline -- --update  以当前诊断重建基线（修完一批旧错后用来收缩）
 *
 * 只卡 error 级别；warning/hint 仅汇总，不影响退出码。
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const root = process.cwd();
const baselinePath = path.join(root, "scripts", "check-baseline.json");
const isUpdate = process.argv.includes("--update");

interface DiagLike {
	severity?: number;
	code?: number | string;
	message?: string;
	range?: { start?: { line?: number; character?: number } };
}

interface FileResultLike {
	fileUrl: URL;
	errors: DiagLike[];
}

interface LintResultLike {
	errors: number;
	warnings: number;
	hints: number;
	fileChecked: number;
	fileResult: FileResultLike[];
}

interface AstroCheckLike {
	lint: (opts: unknown) => Promise<LintResultLike>;
}

interface BaselineFile {
	version: number;
	updatedAt: string;
	totalErrors: number;
	// key = 相对路径:行:列:诊断码；value = 首行消息，方便人工 review
	entries: Record<string, string>;
}

// LSP DiagnosticSeverity：Error=1
const SEVERITY_ERROR = 1;

/**
 * @astrojs/language-server 是 @astrojs/check 的传递依赖，pnpm 下不保证提升到
 * node_modules 顶层，所以从 @astrojs/check 的安装位置去解析它。
 */
async function loadAstroCheck(): Promise<{
	AstroCheck: new (
		root: string,
		tsPath: string,
		tsconfig: string | undefined
	) => AstroCheckLike;
}> {
	const checkEntry = require.resolve("@astrojs/check");
	const lsEntry = require.resolve("@astrojs/language-server", {
		paths: [path.dirname(checkEntry)],
	});
	return import(pathToFileURL(lsEntry).href);
}

function diagKey(relPath: string, d: DiagLike): string {
	const line = (d.range?.start?.line ?? 0) + 1;
	const col = (d.range?.start?.character ?? 0) + 1;
	return `${relPath}:${line}:${col}:${d.code ?? ""}`;
}

function firstLine(msg: string): string {
	return String(msg || "").split("\n")[0].slice(0, 160);
}

async function collect(): Promise<{
	entries: Map<string, string>;
	errors: number;
	warnings: number;
	hints: number;
	files: number;
}> {
	const { AstroCheck } = await loadAstroCheck();
	const checker = new AstroCheck(root, require.resolve("typescript"), undefined);
	// 不传 logErrors：lint() 不会向控制台打印，诊断全部结构化返回
	const result = await checker.lint({});

	const entries = new Map<string, string>();
	for (const fr of result.fileResult) {
		const relPath = path.relative(root, fileURLToPathSafe(fr.fileUrl)).replace(/\\/g, "/");
		for (const d of fr.errors) {
			if (d.severity !== SEVERITY_ERROR) continue;
			entries.set(diagKey(relPath, d), firstLine(d.message || ""));
		}
	}
	return {
		entries,
		errors: result.errors,
		warnings: result.warnings,
		hints: result.hints,
		files: result.fileChecked,
	};
}

function fileURLToPathSafe(u: URL): string {
	// 避免再 import 一次 fileURLToPath，保持依赖面最小
	return decodeURIComponent(u.pathname.replace(/^\/([A-Za-z]:)/, "$1"));
}

function writeBaseline(entries: Map<string, string>, totalErrors: number): void {
	const sorted = Object.fromEntries([...entries.entries()].sort((a, b) => a[0].localeCompare(b[0])));
	const data: BaselineFile = {
		version: 1,
		updatedAt: new Date().toISOString(),
		totalErrors,
		entries: sorted,
	};
	fs.writeFileSync(baselinePath, `${JSON.stringify(data, null, "\t")}\n`, "utf-8");
}

function readBaseline(): BaselineFile | null {
	if (!fs.existsSync(baselinePath)) return null;
	// 兼容 Windows 编辑器（含 PowerShell 5 的 utf8 默认值）写入的 UTF-8 BOM
	let text = fs.readFileSync(baselinePath, "utf-8");
	if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
	const raw = JSON.parse(text) as BaselineFile;
	if (!raw || typeof raw.entries !== "object") return null;
	return raw;
}

function printGroup(title: string, keys: Iterable<string>, getMsg: (k: string) => string): void {
	const list = [...keys];
	if (!list.length) return;
	console.info(`\n${title}（${list.length}）`);
	for (const k of list) {
		const [file, rest] = splitKey(k);
		console.info(`  ${file}:${rest}`);
		const msg = getMsg(k);
		if (msg) console.info(`    ${msg}`);
	}
}

function splitKey(k: string): [file: string, location: string] {
	// key 形如 relPath:line:col:code；相对路径已去掉盘符，从右拆三段即可
	const parts = k.split(":");
	const code = parts.pop() ?? "";
	const col = parts.pop() ?? "";
	const line = parts.pop() ?? "";
	return [parts.join(":"), `${line}:${col} [${code}]`];
}

async function main(): Promise<number> {
	console.info("正在运行 astro check 全量诊断…");
	const { entries, errors, warnings, hints, files } = await collect();
	console.info(
		`扫描 ${files} 个文件：${errors} errors / ${warnings} warnings / ${hints} hints`,
	);

	if (isUpdate) {
		writeBaseline(entries, errors);
		console.info(
			`\n基线已重建：${entries.size} 条 error 写入 ${path.relative(root, baselinePath)}`,
		);
		return 0;
	}

	const baseline = readBaseline();
	if (!baseline) {
		console.info(
			`\n找不到基线文件 ${path.relative(root, baselinePath)}。\n` +
				"首次使用请先执行：pnpm check:baseline -- --update",
		);
		return 1;
	}

	const oldKeys = new Set(Object.keys(baseline.entries));
	const added = [...entries.keys()].filter((k) => !oldKeys.has(k)).sort();
	const removed = [...oldKeys].filter((k) => !entries.has(k)).sort();

	printGroup("新增类型错误（基线之外）", added, (k) => entries.get(k) || "");
	printGroup("已消失的旧错误（可更新基线收缩）", removed, (k) => baseline.entries[k] || "");

	console.info(
		`\n基线 ${oldKeys.size} 条 / 当前 ${entries.size} 条；新增 ${added.length}，消失 ${removed.length}。`,
	);
	if (added.length > 0) {
		console.info(
			"\n请修复新增错误后重跑；若确认是有意调整基线（如重构移动位置），再执行：\n" +
				"  pnpm check:baseline -- --update",
		);
		return 1;
	}
	console.info("没有新增类型错误。");
	return 0;
}

main()
	.then((code) => {
		// Volar/TS 语言服务可能残留句柄，显式退出保证 CI/命令行可靠返回
		process.exit(code);
	})
	.catch((e: unknown) => {
		console.error(e instanceof Error ? e.stack || e.message : String(e));
		process.exit(2);
	});
