import type { APIRoute } from "astro";
import { verifyToken } from "../../../../utils/admin-auth";
import { getSpec, updateSpec } from "../../../../utils/github-api";

export const prerender = false;

// name（不带扩展名） -> 实际文件名
const FILE_MAP: Record<string, string> = {
  about: "about.md",
  guestbook: "guestbook.md",
};

function getName(params: Record<string, unknown>): string {
  const arr = params.name as string[] | undefined;
  return arr ? arr.join("/") : "";
}

// GET /api/admin/spec/[...name] - 获取 spec 页面内容
export const GET: APIRoute = async ({ params, request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = getName(params);
  const filename = FILE_MAP[name];
  if (!filename) {
    return new Response(JSON.stringify({ error: "不允许访问的文件" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await getSpec(filename);
    return new Response(JSON.stringify({ sha: result.sha, content: result.content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "获取页面失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/admin/spec/[...name] - 更新 spec 页面内容
export const PUT: APIRoute = async ({ params, request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = getName(params);
  const filename = FILE_MAP[name];
  if (!filename) {
    return new Response(JSON.stringify({ error: "不允许访问的文件" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { content, sha } = await request.json();
    if (!content || !sha) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await updateSpec(filename, content, sha);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "保存页面失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
