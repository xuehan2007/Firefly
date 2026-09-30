import type { APIRoute } from "astro";
import { verifyToken } from "../../../utils/admin-auth";
import {
  getVersionStore,
  saveVersionStore,
  type VersionEntry,
} from "../../../utils/github-api";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const isAuthed = (request: Request) =>
  verifyToken(request.headers.get("authorization"));

// GET /api/admin/versions?filename=xxx - 列出某篇文章的历史版本
export const GET: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) return json({ error: "未授权" }, 401);

  const filename = new URL(request.url).searchParams.get("filename") || "";
  if (!filename) return json({ error: "缺少 filename" }, 400);

  try {
    const store = await getVersionStore(filename);
    // 列表只返回元信息，避免一次拉取过多正文
    const versions = (store?.versions || []).map((v) => ({
      id: v.id,
      date: v.date,
    }));
    return json({ versions });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "获取历史版本失败" },
      500
    );
  }
};

// POST /api/admin/versions
// action=snapshot {filename, content} - 保存一个快照（自动只保留最近 3 个）
// action=get      {filename, versionId} - 读取某个版本的完整内容
export const POST: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) return json({ error: "未授权" }, 401);

  try {
    const body = await request.json();
    const { filename, action } = body;
    if (!filename) return json({ error: "缺少 filename" }, 400);

    if (action === "snapshot") {
      const content: string = body.content;
      if (typeof content !== "string")
        return json({ error: "缺少 content" }, 400);

      const store = await getVersionStore(filename);
      const versions: VersionEntry[] = store?.versions || [];

      // 与最近一版内容完全相同则不重复记录
      if (!versions[0] || versions[0].content !== content) {
        versions.unshift({
          id: Date.now(),
          date: new Date().toISOString(),
          content,
        });
      }
      const trimmed = versions.slice(0, 3);
      await saveVersionStore(filename, trimmed, store?.sha);
      return json({ success: true, count: trimmed.length });
    }

    if (action === "get") {
      const versionId = Number(body.versionId);
      const store = await getVersionStore(filename);
      const found = (store?.versions || []).find((v) => v.id === versionId);
      if (!found) return json({ error: "版本不存在" }, 404);
      return json({ content: found.content, date: found.date });
    }

    return json({ error: "未知 action" }, 400);
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "操作失败" },
      500
    );
  }
};
