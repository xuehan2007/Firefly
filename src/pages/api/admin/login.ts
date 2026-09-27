import type { APIRoute } from "astro";
import { verifyPassword, generateToken } from "../../../utils/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();
    if (!verifyPassword(password)) {
      return new Response(JSON.stringify({ error: "密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const token = generateToken();
    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "请求失败" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
