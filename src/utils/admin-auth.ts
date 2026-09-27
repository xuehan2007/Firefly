// 管理员认证工具
import crypto from "node:crypto";

// 强制要求环境变量，未设置则拒绝服务
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || "";
const JWT_SECRET = import.meta.env.JWT_SECRET || "";

// 简单的 JWT 实现（HS256）
function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 }));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${body}.${signature}`;
}

function verify(token: string): Record<string, unknown> | null {
  try {
    const [header, body, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64").toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyPassword(password: string): boolean {
  if (!ADMIN_PASSWORD || !password) return false;
  return password === ADMIN_PASSWORD;
}

export function generateToken(): string {
  if (!JWT_SECRET) return "";
  return sign({ role: "admin" });
}

export function verifyToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return verify(token) !== null;
}
