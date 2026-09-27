import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import { listPosts, getPost, parseFrontmatter } from "../../../utils/github-api";

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
    const files = await listPosts();
    const mdFiles = files.filter((f) => f.name.endsWith(".md"));

    let published = 0;
    let drafts = 0;
    let pinned = 0;

    for (const f of mdFiles) {
      try {
        const raw = await getPost(f.name);
        const content = Buffer.from(raw.content, "base64").toString();
        const { data } = parseFrontmatter(content);
        if (data.draft === true) drafts++;
        else published++;
        if (data.pinned === true) pinned++;
      } catch {
        // 解析失败的文章计入已发布
        published++;
      }
    }

    const stats = {
      totalPosts: mdFiles.length,
      published,
      drafts,
      pinned,
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
