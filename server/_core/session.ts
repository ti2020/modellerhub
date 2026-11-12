import { COOKIE_NAME, ONE_WEEK_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV, isAdminEmail } from "./env";

export type SessionPayload = { openId: string; email: string };

function secretKey() {
  if (!ENV.cookieSecret || ENV.cookieSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createSessionToken(
  payload: SessionPayload,
  expiresInMs: number = ONE_WEEK_MS
): Promise<string> {
  return new SignJWT({ openId: payload.openId, email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + expiresInMs) / 1000))
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const { openId, email } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || !openId || typeof email !== "string" || !email) return null;
    return { openId, email };
  } catch {
    return null;
  }
}

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  return parseCookieHeader(header)[name];
}

/**
 * Resolve the signed-in user. Admin access is re-checked against ADMIN_EMAILS on
 * every request, so removing an email from the list revokes access immediately.
 */
export async function authenticateRequest(req: Request): Promise<User | null> {
  const session = await verifySessionToken(readCookie(req, COOKIE_NAME));
  if (!session) return null;
  if (!isAdminEmail(session.email)) return null;

  const user = await db.getUserByOpenId(session.openId);
  if (!user) return null;
  return { ...user, role: "admin" };
}
