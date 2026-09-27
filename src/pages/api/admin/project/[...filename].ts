import type { APIRoute } from "astro";
import { verifyToken } from "../../../../utils/admin-auth";
import { getProject, upsertProject, deleteProject } from "../../../../utils/github-api";

export const prerender = false;

// GET /api/admin/project/:filename - 获取项目内容
export const GET: APIRoute = async ({ params, request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const filename = decodeURIComponent((params.filename as string[]).join('/'));
    const raw = await getProject(filename);
    const content = Buffer.from(raw.content, "base64").toString();
    return new Response(JSON.stringify({ filename, sha: raw.sha, content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "获取项目失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/admin/project/:filename - 更新项目
export const PUT: APIRoute = async ({ params, request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const filename = decodeURIComponent((params.filename as string[]).join('/'));
    const { content, sha } = await request.json();
    if (!content || !sha) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await upsertProject(filename, content, sha);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "更新项目失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE /api/admin/project/:filename - 删除项目
export const DELETE: APIRoute = async ({ params, request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const filename = decodeURIComponent((params.filename as string[]).join('/'));
    const { sha } = await request.json();
    if (!sha) {
      return new Response(JSON.stringify({ error: "缺少 sha" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await deleteProject(filename, sha);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "删除项目失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
