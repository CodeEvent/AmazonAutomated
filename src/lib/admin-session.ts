import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "wayfarer_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * Builds a signed "<email>.<expiry>.<signature>" token — no session table needed.
 * The email is base64url-encoded before joining so a "." in the address itself
 * (e.g. "admin@wayfarer.test") can't be mistaken for a field separator.
 */
export function createAdminSessionToken(email: string): string {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const emailEncoded = Buffer.from(email, "utf8").toString("base64url");
  const payload = `${emailEncoded}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [emailEncoded, expiresRaw, signature] = parts;
  const payload = `${emailEncoded}.${expiresRaw}`;
  const expected = sign(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expires = Number(expiresRaw);
  return Number.isFinite(expires) && Date.now() < expires;
}

export async function setAdminSessionCookie(email: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, createAdminSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
}

export async function isAdminSessionValid(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

/** Call at the top of every protected admin page/layout and every mutating admin action. */
export async function requireAdmin() {
  if (!(await isAdminSessionValid())) {
    redirect("/admin/login");
  }
}
