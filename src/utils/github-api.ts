// GitHub API 封装，用于读写博客文章
const REPO = "xuehan2007/Firefly";
const BRANCH = "master";
const POSTS_PATH = "src/content/posts";
const PROJECTS_PATH = "src/content/projects";
const DYNAMIC_PATH = "src/content/dynamic";
const DATA_PATH = "src/data";
const SPEC_PATH = "src/content/spec";
const TOKEN = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || "";

const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

export interface PostFile {
  name: string;
  path: string;
  sha: string;
  download_url: string;
}

export interface PostContent {
  sha: string;
  content: string; // base64
}

// 获取文章列表
export async function listPosts(): Promise<PostFile[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取文章列表失败: ${res.status}`);
  return res.json();
}

// 获取文章内容
export async function getPost(path: string): Promise<PostContent> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}/${path}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取文章失败: ${res.status}`);
  return res.json();
}

// 创建或更新文章
export async function upsertPost(filename: string, content: string, sha?: string) {
  const body: Record<string, unknown> = {
    message: `admin: ${sha ? "更新" : "新建"}文章 ${filename}`,
    content: Buffer.from(content).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}/${filename}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    let msg = `保存文章失败: ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) msg += ` - ${err.message}`;
      if (res.status === 403) {
        msg += "（通常是 GITHUB_TOKEN 缺少仓库 Contents 写入权限）";
      }
    } catch {
      // 无法解析响应体，忽略
    }
    throw new Error(msg);
  }
  return res.json();
}

// 删除文章
export async function deletePost(filename: string, sha: string) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}/${filename}`,
    {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        message: `admin: 删除文章 ${filename}`,
        sha,
        branch: BRANCH,
      }),
    }
  );
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

// ========== 项目管理 ==========
export async function listProjects(): Promise<PostFile[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取项目列表失败: ${res.status}`);
  const files: PostFile[] = await res.json();
  return files.filter((f) => f.name.endsWith(".md") || f.name.endsWith(".mdx"));
}

export async function getProject(path: string): Promise<PostContent> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}/${path}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取项目失败: ${res.status}`);
  return res.json();
}

export async function upsertProject(filename: string, content: string, sha?: string) {
  const body: Record<string, unknown> = {
    message: `admin: ${sha ? "更新" : "新建"}项目 ${filename}`,
    content: Buffer.from(content).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}/${filename}`,
    { method: "PUT", headers, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    let msg = `保存项目失败: ${res.status}`;
    try { const err = await res.json(); if (err.message) msg += ` - ${err.message}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteProject(filename: string, sha: string) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${PROJECTS_PATH}/${filename}`,
    { method: "DELETE", headers, body: JSON.stringify({ message: `admin: 删除项目 ${filename}`, sha, branch: BRANCH }) }
  );
  if (!res.ok) {
    let msg = `删除项目失败: ${res.status}`;
    try { const err = await res.json(); if (err.message) msg += ` - ${err.message}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ========== 动态/说说管理 ==========
export async function listDynamics(): Promise<PostFile[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取动态列表失败: ${res.status}`);
  const files: PostFile[] = await res.json();
  return files.filter((f) => f.name.endsWith(".md"));
}

export async function getDynamic(path: string): Promise<PostContent> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}/${path}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取动态失败: ${res.status}`);
  return res.json();
}

export async function upsertDynamic(filename: string, content: string, sha?: string) {
  const body: Record<string, unknown> = {
    message: `admin: ${sha ? "更新" : "新建"}动态 ${filename}`,
    content: Buffer.from(content).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}/${filename}`,
    { method: "PUT", headers, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    let msg = `保存动态失败: ${res.status}`;
    try { const err = await res.json(); if (err.message) msg += ` - ${err.message}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteDynamic(filename: string, sha: string) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${DYNAMIC_PATH}/${filename}`,
    { method: "DELETE", headers, body: JSON.stringify({ message: `admin: 删除动态 ${filename}`, sha, branch: BRANCH }) }
  );
  if (!res.ok) {
    let msg = `删除动态失败: ${res.status}`;
    try { const err = await res.json(); if (err.message) msg += ` - ${err.message}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// 解析 frontmatter
export function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const data: Record<string, unknown> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      let val: unknown = m[2].trim();
      // 尝试解析数组 [a, b, c]
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
      // 布尔值
      if (val === "true") val = true;
      if (val === "false") val = false;
      data[m[1]] = val;
    }
  }
  return { data, body: match[2] };
}

// 生成 frontmatter
export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  let fm = "---\n";
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      fm += `${key}: [${val.map((v) => `"${v}"`).join(", ")}]\n`;
    } else if (typeof val === "boolean") {
      fm += `${key}: ${val}\n`;
    } else {
      fm += `${key}: ${val}\n`;
    }
  }
  fm += "---\n";
  return fm + body;
}

// ========== 通用 JSON 数据文件读写 ==========
// 本地文件回退（无 GITHUB_TOKEN 时使用，仅用于本地开发）
import fs from "node:fs";
import path from "node:path";
const LOCAL_DATA_DIR = path.resolve(process.cwd(), "src", "data");

// 获取 JSON 数据文件内容（解析后返回对象）
export async function getDataFile(name: string): Promise<{ sha: string; data: unknown }> {
  // 本地回退：无 token 时直接读本地文件
  if (!TOKEN) {
    const filePath = path.join(LOCAL_DATA_DIR, name);
    let content = fs.readFileSync(filePath, "utf-8");
    // 去除 UTF-8 BOM
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
    const data = JSON.parse(content);
    // 用文件内容的 hash 作为 sha（本地不需要真实 sha）
    const sha = Buffer.from(content).toString("base64").slice(0, 40);
    return { sha, data };
  }

  // 1. 用 Contents API 获取 sha 和 content（base64）
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}/${name}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取数据文件 ${name} 失败: ${res.status}`);
  const raw = await res.json();
  if (Array.isArray(raw)) throw new Error(`路径是目录而非文件: ${name}`);
  const sha = raw.sha;
  if (!sha) throw new Error(`数据文件 ${name} 缺少 sha`);

  // 2. 优先用 raw.githubusercontent.com 获取内容；失败则回退到 Contents API 的 content 字段
  let content: string;
  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_PATH}/${name}`
    );
    if (!rawRes.ok) throw new Error(`raw ${rawRes.status}`);
    content = await rawRes.text();
  } catch {
    if (typeof raw.content === "string") {
      content = Buffer.from(raw.content, "base64").toString();
    } else if (raw.download_url) {
      const dlRes = await fetch(raw.download_url, { headers });
      if (!dlRes.ok) throw new Error(`下载数据文件 ${name} 失败: ${dlRes.status}`);
      content = await dlRes.text();
    } else {
      throw new Error(`无法获取数据文件 ${name} 的内容`);
    }
  }
  const data = JSON.parse(content);
  return { sha, data };
}

// 更新 JSON 数据文件
export async function updateDataFile(name: string, data: unknown, sha: string) {
  const content = JSON.stringify(data, null, 2) + "\n";

  // 本地回退：无 token 时直接写本地文件
  if (!TOKEN) {
    const filePath = path.join(LOCAL_DATA_DIR, name);
    fs.writeFileSync(filePath, content, "utf-8");
    return { sha: "local" };
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}/${name}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `admin: 更新数据文件 ${name}`,
        content: Buffer.from(content).toString("base64"),
        sha,
        branch: BRANCH,
      }),
    }
  );
  if (!res.ok) {
    let msg = `保存数据文件 ${name} 失败: ${res.status}`;
    try { const err = await res.json(); if (err.message) msg += ` - ${err.message}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ========== Spec 页面（关于/留言板）读写 ==========
export async function getSpec(filename: string): Promise<{ sha: string; content: string }> {
  // 1. 用 Contents API 获取 sha 和 content（base64）
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${SPEC_PATH}/${filename}?ref=${BRANCH}`,
    { headers }
  );
  if (!res.ok) throw new Error(`获取页面 ${filename} 失败: ${res.status}`);
  const raw = await res.json();
  if (Array.isArray(raw)) throw new Error(`路径是目录而非文件: ${filename}`);
  const sha = raw.sha;
  if (!sha) throw new Error(`页面 ${filename} 缺少 sha`);

  // 2. 优先用 raw.githubusercontent.com 获取内容；失败则回退到 Contents API 的 content 字段
  let content: string;
  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SPEC_PATH}/${filename}`
    );
    if (!rawRes.ok) throw new Error(`raw ${rawRes.status}`);
    content = await rawRes.text();
  } catch {
    if (typeof raw.content === "string") {
      content = Buffer.from(raw.content, "base64").toString();
    } else if (raw.download_url) {
      const dlRes = await fetch(raw.download_url, { headers });
      if (!dlRes.ok) throw new Error(`下载页面 ${filename} 失败: ${dlRes.status}`);
      content = await dlRes.text();
    } else {
      throw new Error(`无法获取页面 ${filename} 的内容`);
    }
  }
  return { sha, content };
}

export async function updateSpec(filename: string, content: string, sha: string) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${SPEC_PATH}/${filename}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `admin: 更新页面 ${filename}`,
        content: Buffer.from(content).toString("base64"),
        sha,
        branch: BRANCH,
      }),
    }
  );
  if (!res.ok) {
    let msg = `保存页面 ${filename} 失败: ${res.status}`;
    try { const err = await res.json(); if (err.message) msg += ` - ${err.message}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}
