import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import { listProjects, getProject, upsertProject, parseFrontmatter } from "../../../utils/github-api";

export const prerender = false;

// GET /api/admin/projects - 获取项目列表
export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const files = await listProjects();
    const projects = [];
    for (const f of files) {
      try {
        const raw = await getProject(f.name);
        const content = Buffer.from(raw.content, "base64").toString();
        const { data } = parseFrontmatter(content);
        projects.push({
          filename: f.name,
          sha: raw.sha,
          title: data.title || f.name,
          published: data.published || null,
          status: data.status || "",
          description: data.description || "",
          draft: data.draft === true,
        });
      } catch {
        projects.push({ filename: f.name, sha: f.sha, title: f.name });
      }
    }
    projects.sort((a, b) => {
      const ta = a.published ? new Date(a.published).getTime() : 0;
      const tb = b.published ? new Date(b.published).getTime() : 0;
      return tb - ta;
    });

    return new Response(JSON.stringify(projects), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "获取项目列表失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST /api/admin/projects - 新建项目
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
    await upsertProject(filename, content);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "创建项目失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
