import fs from "node:fs";
import path from "node:path";
//#region src/utils/github-api.ts
var REPO = "xuehan2007/Firefly";
var BRANCH = "master";
var POSTS_PATH = "src/content/posts";
var PROJECTS_PATH = "src/content/projects";
var DYNAMIC_PATH = "src/content/dynamic";
var DATA_PATH = "src/data";
var SPEC_PATH = "src/content/spec";
var TOKEN = process.env.GITHUB_TOKEN || "";
var headers = {
	Authorization: `token ${TOKEN}`,
	Accept: "application/vnd.github+json",
	"Content-Type": "application/json"
};
async function listPosts() {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取文章列表失败: ${res.status}`);
	return res.json();
}
async function getPost(path2) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}/${path2}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取文章失败: ${res.status}`);
	return res.json();
}
async function upsertPost(filename, content, sha) {
	const body = {
		message: `admin: ${sha ? "更新" : "新建"}文章 ${filename}`,
		content: Buffer.from(content).toString("base64"),
		branch: BRANCH
	};
	if (sha) body.sha = sha;
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}/${filename}`, {
		method: "PUT",
		headers,
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		let msg = `保存文章失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
			if (res.status === 403) msg += "（通常是 GITHUB_TOKEN 缺少仓库 Contents 写入权限）";
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
async function deletePost(filename, sha) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}/${filename}`, {
		method: "DELETE",
		headers,
		body: JSON.stringify({
			message: `admin: 删除文章 ${filename}`,
			sha,
			branch: BRANCH
		})
	});
	if (!res.ok) {
		let msg = `删除文章失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
async function listProjects() {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取项目列表失败: ${res.status}`);
	return (await res.json()).filter((f) => f.name.endsWith(".md") || f.name.endsWith(".mdx"));
}
async function getProject(path2) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}/${path2}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取项目失败: ${res.status}`);
	return res.json();
}
async function upsertProject(filename, content, sha) {
	const body = {
		message: `admin: ${sha ? "更新" : "新建"}项目 ${filename}`,
		content: Buffer.from(content).toString("base64"),
		branch: BRANCH
	};
	if (sha) body.sha = sha;
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}/${filename}`, {
		method: "PUT",
		headers,
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		let msg = `保存项目失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
async function deleteProject(filename, sha) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}/${filename}`, {
		method: "DELETE",
		headers,
		body: JSON.stringify({
			message: `admin: 删除项目 ${filename}`,
			sha,
			branch: BRANCH
		})
	});
	if (!res.ok) {
		let msg = `删除项目失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
async function listDynamics() {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取动态列表失败: ${res.status}`);
	return (await res.json()).filter((f) => f.name.endsWith(".md"));
}
async function getDynamic(path2) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}/${path2}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取动态失败: ${res.status}`);
	return res.json();
}
async function upsertDynamic(filename, content, sha) {
	const body = {
		message: `admin: ${sha ? "更新" : "新建"}动态 ${filename}`,
		content: Buffer.from(content).toString("base64"),
		branch: BRANCH
	};
	if (sha) body.sha = sha;
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}/${filename}`, {
		method: "PUT",
		headers,
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		let msg = `保存动态失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
async function deleteDynamic(filename, sha) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}/${filename}`, {
		method: "DELETE",
		headers,
		body: JSON.stringify({
			message: `admin: 删除动态 ${filename}`,
			sha,
			branch: BRANCH
		})
	});
	if (!res.ok) {
		let msg = `删除动态失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
function parseFrontmatter(content) {
	const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
	if (!match) return {
		data: {},
		body: content
	};
	const data = {};
	const lines = match[1].split("\n");
	for (const line of lines) {
		const m = line.match(/^(\w+):\s*(.*)$/);
		if (m) {
			let val = m[2].trim();
			if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
			if (val === "true") val = true;
			if (val === "false") val = false;
			data[m[1]] = val;
		}
	}
	return {
		data,
		body: match[2]
	};
}
var LOCAL_DATA_DIR = path.resolve(process.cwd(), "src", "data");
async function getDataFile(name) {
	if (!TOKEN) {
		const filePath = path.join(LOCAL_DATA_DIR, name);
		let content2 = fs.readFileSync(filePath, "utf-8");
		if (content2.charCodeAt(0) === 65279) content2 = content2.slice(1);
		const data2 = JSON.parse(content2);
		return {
			sha: Buffer.from(content2).toString("base64").slice(0, 40),
			data: data2
		};
	}
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}/${name}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取数据文件 ${name} 失败: ${res.status}`);
	const raw = await res.json();
	if (Array.isArray(raw)) throw new Error(`路径是目录而非文件: ${name}`);
	const sha = raw.sha;
	if (!sha) throw new Error(`数据文件 ${name} 缺少 sha`);
	let content;
	try {
		const rawRes = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_PATH}/${name}`);
		if (!rawRes.ok) throw new Error(`raw ${rawRes.status}`);
		content = await rawRes.text();
	} catch {
		if (typeof raw.content === "string") content = Buffer.from(raw.content, "base64").toString();
		else if (raw.download_url) {
			const dlRes = await fetch(raw.download_url, { headers });
			if (!dlRes.ok) throw new Error(`下载数据文件 ${name} 失败: ${dlRes.status}`);
			content = await dlRes.text();
		} else throw new Error(`无法获取数据文件 ${name} 的内容`);
	}
	return {
		sha,
		data: JSON.parse(content)
	};
}
async function updateDataFile(name, data, sha) {
	const content = JSON.stringify(data, null, 2) + "\n";
	if (!TOKEN) {
		const filePath = path.join(LOCAL_DATA_DIR, name);
		fs.writeFileSync(filePath, content, "utf-8");
		return { sha: "local" };
	}
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}/${name}`, {
		method: "PUT",
		headers,
		body: JSON.stringify({
			message: `admin: 更新数据文件 ${name}`,
			content: Buffer.from(content).toString("base64"),
			sha,
			branch: BRANCH
		})
	});
	if (!res.ok) {
		let msg = `保存数据文件 ${name} 失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
async function getSpec(filename) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${SPEC_PATH}/${filename}?ref=${BRANCH}`, { headers });
	if (!res.ok) throw new Error(`获取页面 ${filename} 失败: ${res.status}`);
	const raw = await res.json();
	if (Array.isArray(raw)) throw new Error(`路径是目录而非文件: ${filename}`);
	const sha = raw.sha;
	if (!sha) throw new Error(`页面 ${filename} 缺少 sha`);
	let content;
	try {
		const rawRes = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SPEC_PATH}/${filename}`);
		if (!rawRes.ok) throw new Error(`raw ${rawRes.status}`);
		content = await rawRes.text();
	} catch {
		if (typeof raw.content === "string") content = Buffer.from(raw.content, "base64").toString();
		else if (raw.download_url) {
			const dlRes = await fetch(raw.download_url, { headers });
			if (!dlRes.ok) throw new Error(`下载页面 ${filename} 失败: ${dlRes.status}`);
			content = await dlRes.text();
		} else throw new Error(`无法获取页面 ${filename} 的内容`);
	}
	return {
		sha,
		content
	};
}
async function updateSpec(filename, content, sha) {
	const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${SPEC_PATH}/${filename}`, {
		method: "PUT",
		headers,
		body: JSON.stringify({
			message: `admin: 更新页面 ${filename}`,
			content: Buffer.from(content).toString("base64"),
			sha,
			branch: BRANCH
		})
	});
	if (!res.ok) {
		let msg = `保存页面 ${filename} 失败: ${res.status}`;
		try {
			const err = await res.json();
			if (err.message) msg += ` - ${err.message}`;
		} catch {}
		throw new Error(msg);
	}
	return res.json();
}
//#endregion
export { upsertProject as _, getDynamic as a, getSpec as c, listProjects as d, parseFrontmatter as f, upsertPost as g, upsertDynamic as h, getDataFile as i, listDynamics as l, updateSpec as m, deletePost as n, getPost as o, updateDataFile as p, deleteProject as r, getProject as s, deleteDynamic as t, listPosts as u };
