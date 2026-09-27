import type { APIRoute } from "astro";

// GitHub OAuth App 配置（在部署平台环境变量中设置）
//   OAUTH_CLIENT_ID
//   OAUTH_CLIENT_SECRET
const CLIENT_ID = import.meta.env.OAUTH_CLIENT_ID || "";

export const GET: APIRoute = ({ url }) => {
  if (!CLIENT_ID) {
    return new Response("OAUTH_CLIENT_ID 未配置，请在部署平台设置环境变量", {
      status: 500,
    });
  }

  const redirectUri = `${url.origin}/api/callback`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: "repo",
    redirect_uri: redirectUri,
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
    302,
  );
};
