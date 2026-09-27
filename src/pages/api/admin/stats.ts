import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import { listPosts } from "../../../utils/github-api";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!verifyToken(auth)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const posts = await listPosts();
    const stats = {
      totalPosts: posts.filter((p) => p.name.endsWith(".md")).length,
    };
    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "获取统计失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
