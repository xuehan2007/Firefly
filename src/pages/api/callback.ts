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

    // 用 token 获取 GitHub 用户信息
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${data.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const userData = await userRes.json();

    // 构造 Decap CMS / Sveltia CMS 兼容的用户对象
    const userObj = {
      login: userData.login || "",
      token: data.access_token,
      name: userData.name || userData.login || "",
      email: userData.email || "",
    };

    // 安全传递：用 JSON script 标签
    const userJson = JSON.stringify(userObj);
    const html = `<!DOCTYPE html><html><body>
      <script type="application/json" id="user-data">${userJson}</script>
      <script>
        (function() {
          var dataEl = document.getElementById('user-data');
          var user = JSON.parse(dataEl.textContent);

          // 存入 sessionStorage（临时，会话结束自动清除）作为 postMessage 失败时的备份
          try {
            sessionStorage.setItem('cms-oauth-token', user.token);
          } catch(e) {}

          // 优先用 postMessage 通知 opener（弹窗模式）
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              access_token: user.token,
              provider: 'github'
            }, '*');
            setTimeout(function() { window.close(); }, 600);
          } else {
            // 当前窗口模式：直接跳回 admin
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
