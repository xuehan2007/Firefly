import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import { listPosts, getPost, upsertPost, parseFrontmatter } from "../../../utils/github-api";

export const prerender = false;

// GET /api/admin/posts - 获取文章列表
export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const files = await listPosts();
    const mdFiles = files.filter((f) => f.name.endsWith(".md"));

    // 获取每篇文章的 frontmatter
    const posts = [];
    for (const f of mdFiles) {
      try {
        const raw = await getPost(f.name);
        const content = Buffer.from(raw.content, "base64").toString();
        const { data } = parseFrontmatter(content);
        posts.push({
          filename: f.name,
          sha: raw.sha,
          title: data.title || f.name,
          published: data.published || null,
          category: data.category || "",
          tags: data.tags || [],
          draft: data.draft === true,
          pinned: data.pinned === true,
        });
      } catch {
        posts.push({ filename: f.name, sha: f.sha, title: f.name });
      }
    }
    // 按发布时间倒序
    posts.sort((a, b) => {
      const ta = a.published ? new Date(String(a.published)).getTime() : 0;
      const tb = b.published ? new Date(String(b.published)).getTime() : 0;
      return tb - ta;
    });

    return new Response(JSON.stringify(posts), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "获取文章列表失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST /api/admin/posts - 新建文章
export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { filename, content } = await request.json();
    if (!filename || !content) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await upsertPost(filename, content);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "创建文章失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
