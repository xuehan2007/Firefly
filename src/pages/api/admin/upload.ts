import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import {
  REPO,
  BRANCH,
  uploadImage,
  deleteImage,
  listUploads,
  getRepoTree,
} from "../../../utils/github-api";

export const prerender = false;

// GET /api/admin/upload - 列出 uploads 下所有图片，并检测是否被文章引用
// 引用检测开销较大（需读仓库文本文件），服务端缓存 5 分钟
let cache: { at: number; data: unknown } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export const GET: APIRoute = async ({ request }) => {
  if (!verifyToken(request.headers.get("authorization"))) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (cache && Date.now() - cache.at < CACHE_TTL) {
      return new Response(JSON.stringify(cache.data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const files = await listUploads();
    const tree = await getRepoTree();

    // 只取 src/content 下的 md/mdx 文本文件，读取正文用于引用检测
    const textPaths = tree
      .filter(
        (t) =>
          t.type === "blob" &&
          t.path.startsWith("src/content/") &&
          /\.(md|mdx)$/.test(t.path)
      )
      .map((t) => t.path);

    const chunks = await Promise.all(
      textPaths.map(async (p) => {
        try {
          const r = await fetch(
            `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p}`
          );
          return r.ok ? await r.text() : "";
        } catch {
          return "";
        }
      })
    );
    const allText = chunks.join("\n");

    const list = files.map((f) => ({
      name: f.name,
      path: f.path,
      sha: f.sha,
      size: f.size,
      url: `/uploads/${f.name}`,
      referenced: allText.includes(`/uploads/${f.name}`),
    }));

    cache = { at: Date.now(), data: list };
    return new Response(JSON.stringify(list), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "获取图片库失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// POST /api/admin/upload - 上传图片到 GitHub
export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { type, filename, content } = await request.json();
    if (!filename || !content) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await uploadImage(type || "post", filename, content);
    cache = null;
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "上传失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE /api/admin/upload - 删除 GitHub 上的图片
export const DELETE: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { path } = await request.json();
    if (!path) {
      return new Response(JSON.stringify({ error: "缺少 path 参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await deleteImage(path);
    cache = null;
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "删除失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

