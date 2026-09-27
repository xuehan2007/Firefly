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

    // 安全地传递 token：用 JSON script 标签，避免 XSS
    const tokenData = JSON.stringify({ access_token: data.access_token, provider: "github" });
    const html = `<!DOCTYPE html><html><body>
      <script type="application/json" id="oauth-data">${tokenData}</script>
      <script>
        (function() {
          var dataEl = document.getElementById('oauth-data');
          var data = JSON.parse(dataEl.textContent);
          var token = data.access_token;

          // 存入 localStorage 作为备份
          try { localStorage.setItem('decap-cms-github-token', token); } catch(e) {}

          // 通过 postMessage 传给 opener
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(data, '*');
            setTimeout(function() { window.close(); }, 800);
          } else {
            window.location.href = '/admin/';
          }
        })();
      </script>
    </body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return new Response("OAuth 回调出错: " + (err as Error).message, {
      status: 500,
    });
  }
};
