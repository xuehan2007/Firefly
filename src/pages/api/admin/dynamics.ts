import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import { listDynamics, getDynamic, upsertDynamic, parseFrontmatter } from "../../../utils/github-api";

export const prerender = false;

// GET /api/admin/dynamics - 获取动态列表
export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const files = await listDynamics();
    const dynamics = [];
    for (const f of files) {
      try {
        const raw = await getDynamic(f.name);
        const content = Buffer.from(raw.content, "base64").toString();
        const { data, body } = parseFrontmatter(content);
        dynamics.push({
          filename: f.name,
          sha: raw.sha,
          published: data.published || null,
          preview: body.replace(/!\[.*?\]\(.*?\)/g, "[图片]").replace(/\n/g, " ").slice(0, 60),
        });
      } catch {
        dynamics.push({ filename: f.name, sha: f.sha, published: null, preview: "" });
      }
    }
    dynamics.sort((a, b) => {
      const ta = a.published ? new Date(String(a.published)).getTime() : 0;
      const tb = b.published ? new Date(String(b.published)).getTime() : 0;
      return tb - ta;
    });

    return new Response(JSON.stringify(dynamics), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "获取动态列表失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST /api/admin/dynamics - 新建动态
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
    await upsertDynamic(filename, content);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "创建动态失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
