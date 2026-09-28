import crypto from "node:crypto";
//#region src/utils/admin-auth.ts
var ADMIN_PASSWORD = "test123";
var JWT_SECRET = "test-secret-for-local-dev-only";
function base64url(str) {
	return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function sign(payload) {
	const header = base64url(JSON.stringify({
		alg: "HS256",
		typ: "JWT"
	}));
	const body = base64url(JSON.stringify({
		...payload,
		exp: Date.now() + 6048e5
	}));
	return `${header}.${body}.${crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")}`;
}
function verify(token) {
	try {
		const [header, body, signature] = token.split(".");
		if (signature !== crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")) return null;
		const payload = JSON.parse(Buffer.from(body, "base64").toString());
		if (payload.exp && payload.exp < Date.now()) return null;
		return payload;
	} catch {
		return null;
	}
}
function verifyPassword(password) {
	if (!password) return false;
	return password === ADMIN_PASSWORD;
}
function generateToken() {
	return sign({ role: "admin" });
}
function verifyToken(authHeader) {
	if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
	return verify(authHeader.slice(7)) !== null;
}
//#endregion
export { verifyPassword as n, verifyToken as r, generateToken as t };
