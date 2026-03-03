import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

const COOKIE_NAME_BOSS = "icf_boss_token";
const COOKIE_NAME_ADMIN = "icf_admin_token";
const JWT_EXPIRY = "24h";

export type BossPayload = {
  role: "boss";
  bossId: string;
};

export type AdminPayload = {
  role: "admin";
  adminId: string;
  username: string;
};

export type JwtPayload = BossPayload | AdminPayload;

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(
  response: Response,
  token: string,
  role: "boss" | "admin"
): void {
  const cookieName = role === "boss" ? COOKIE_NAME_BOSS : COOKIE_NAME_ADMIN;
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = 24 * 60 * 60; // 24 hours in seconds

  response.headers.append(
    "Set-Cookie",
    `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${isProduction ? "; Secure" : ""}`
  );
}

export function clearAuthCookie(response: Response, role: "boss" | "admin"): void {
  const cookieName = role === "boss" ? COOKIE_NAME_BOSS : COOKIE_NAME_ADMIN;
  response.headers.append(
    "Set-Cookie",
    `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export async function getBossFromCookie(): Promise<BossPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME_BOSS)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "boss") return null;

  return payload as BossPayload;
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME_ADMIN)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;

  return payload as AdminPayload;
}

export { COOKIE_NAME_BOSS, COOKIE_NAME_ADMIN };
