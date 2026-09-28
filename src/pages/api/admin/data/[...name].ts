import type { APIRoute } from "astro";
import { verifyToken } from "../../../../utils/admin-auth";
import { getDataFile, updateDataFile } from "../../../../utils/github-api";

export const prerender = false;

// name（不带扩展名） -> 实际文件名
const FILE_MAP: Record<string, string> = {
  music: "music.json",
  booknav: "booknav.json",
  gallery: "gallery.json",
  sponsor: "sponsor.json",
  profile: "profile.json",
  announcement: "announcement.json",
  effects: "effects.json",
  friends: "friends.json",
  backgroundWallpaper: "backgroundWallpaper.json",
  sidebar: "sidebar.json",
  navbar: "navbar.json",
  site: "site.json",
  footer: "footer.json",
  search: "search.json",
  font: "font.json",
  coverImage: "coverImage.json",
  license: "license.json",
  pio: "pio.json",
  musicPlayer: "musicPlayer.json",
};

function getName(params: Record<string, unknown>): string {
  const name = params.name;
  if (Array.isArray(name)) return name.join("/");
  if (typeof name === "string") return name;
  return "";
}

// GET /api/admin/data/[...name] - 获取 JSON 数据
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
    const result = await getDataFile(filename);
    return new Response(JSON.stringify({ sha: result.sha, data: result.data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "获取数据失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/admin/data/[...name] - 更新 JSON 数据
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
    const { data, sha } = await request.json();
    if (!data || !sha) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await updateDataFile(filename, data, sha);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "保存数据失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
