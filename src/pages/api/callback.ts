import type { APIRoute } from "astro";

// 服务端渲染（混合模式下 API 路由必须设置）
export const prerender = false;

const CLIENT_ID = import.meta.env.OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = import.meta.env.OAUTH_CLIENT_SECRET || "";

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("缺少授权码 code", { status: 400 });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response("OAuth 配置缺失，请设置 OAUTH_CLIENT_ID 和 OAUTH_CLIENT_SECRET", {
      status: 500,
    });
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (!data.access_token) {
      return new Response("获取 access token 失败", { status: 400 });
    }

    // 通过 postMessage 把 token 传给前端的 Decap CMS
    const html = `<!DOCTYPE html><html><body><script>
      window.opener.postMessage({
        access_token: '${data.access_token}',
        provider: 'github'
      }, '*');
      window.close();
    </script></body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return new Response("OAuth 回调出错: " + (err as Error).message, {
      status: 500,
    });
  }
};
