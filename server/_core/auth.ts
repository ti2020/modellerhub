import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

/**
 * Google sign-in (OAuth 2.0 authorization-code flow).
 *
 *   /api/auth/google           → redirects the browser to Google
 *   /api/auth/google/callback  → Google sends the user back here; we create a session
 *
 * Only emails listed in ADMIN_EMAILS become admins. Anyone else can sign in
 * but gets the "user" role, which has no write access.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const STATE_COOKIE = "oauth_state";

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

type SessionPayload = { openId: string };

const secretKey = () => new TextEncoder().encode(ENV.sessionSecret);

export function isAdminEmail(email: string | null | undefined) {
  return !!email && ENV.adminEmails.includes(email.trim().toLowerCase());
}

/** Prefixed so Google IDs can never collide with IDs from another provider later. */
export const googleOpenId = (sub: string) => `google:${sub}`;

function baseUrl(req: Request) {
  return ENV.publicUrl || `${req.protocol}://${req.get("host")}`;
}

export async function createSessionToken(openId: string) {
  return new SignJWT({ openId } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_MAX_AGE_MS) / 1000))
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token || !ENV.sessionSecret) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.openId === "string" && payload.openId ? { openId: payload.openId } : null;
  } catch {
    return null;
  }
}

/** Returns the signed-in user for a request, or null. */
export async function authenticateRequest(req: Request): Promise<User | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const session = await verifySessionToken(cookies[COOKIE_NAME]);
  if (!session) return null;
  const user = await db.getUserByOpenId(session.openId);
  if (!user) return null;
  // ADMIN_EMAILS is the source of truth: removing an email revokes admin immediately.
  return { ...user, role: isAdminEmail(user.email) ? "admin" : "user" };
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      res.status(500).send("Google sign-in is not configured (GOOGLE_CLIENT_ID missing).");
      return;
    }
    const state = randomBytes(24).toString("hex");
    res.cookie(STATE_COOKIE, state, {
      ...getSessionCookieOptions(req),
      maxAge: 10 * 60 * 1000,
    });

    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", `${baseUrl(req)}/api/auth/google/callback`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const expectedState = parseCookieHeader(req.headers.cookie ?? "")[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });

    if (!code || !state || state !== expectedState) {
      res.status(400).send("Sign-in failed: invalid or expired request. Please try again.");
      return;
    }

    try {
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: `${baseUrl(req)}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
      const { access_token } = (await tokenRes.json()) as { access_token?: string };
      if (!access_token) throw new Error("no access token returned");

      const infoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!infoRes.ok) throw new Error(`userinfo failed (${infoRes.status})`);
      const info = (await infoRes.json()) as GoogleUserInfo;
      if (!info.sub || !info.email || info.email_verified === false) {
        res.status(403).send("Sign-in failed: your Google account email is not verified.");
        return;
      }

      const openId = googleOpenId(info.sub);
      await db.upsertUser({
        openId,
        name: info.name ?? null,
        email: info.email,
        loginMethod: "google",
        role: isAdminEmail(info.email) ? "admin" : "user",
        lastSignedIn: new Date(),
      });

      const token = await createSessionToken(openId);
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: SESSION_MAX_AGE_MS });
      res.redirect(302, isAdminEmail(info.email) ? "/admin" : "/");
    } catch (error) {
      console.error("[Auth] Google callback failed:", error);
      res.status(500).send("Sign-in failed. Please try again.");
    }
  });
}
