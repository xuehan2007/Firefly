import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import { uploadImage, deleteImage } from "../../../utils/github-api";

export const prerender = false;

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

