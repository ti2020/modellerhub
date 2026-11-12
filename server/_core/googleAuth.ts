import { COOKIE_NAME, ONE_WEEK_MS } from "@shared/const";
import { randomBytes } from "crypto";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV, isAdminEmail } from "./env";
import { createSessionToken, readCookie } from "./session";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const STATE_COOKIE = "google_oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function origin(req: Request) {
  if (ENV.publicUrl) return ENV.publicUrl;
  return `${req.protocol}://${req.get("host")}`;
}

function redirectUri(req: Request) {
  return `${origin(req)}/api/auth/google/callback`;
}

function deny(res: Response, status: number, message: string) {
  res
    .status(status)
    .type("html")
    .send(
      `<!doctype html><meta charset="utf-8"><title>ModellerHub admin</title>` +
        `<body style="font-family:system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 24px;color:#002B5C">` +
        `<h1>Sign-in not allowed</h1><p>${message}</p><p><a href="/">Back to ModellerHub</a></p></body>`
    );
}

export function registerGoogleAuthRoutes(app: Express) {
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      deny(res, 500, "Google sign-in is not configured on the server.");
      return;
    }
    const state = randomBytes(24).toString("hex");
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: getSessionCookieOptions(req).secure,
      path: "/api/auth/google",
      maxAge: STATE_TTL_MS,
    });
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri(req));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const expectedState = readCookie(req, STATE_COOKIE);
    res.clearCookie(STATE_COOKIE, { path: "/api/auth/google" });

    if (!code || !state || !expectedState || state !== expectedState) {
      deny(res, 400, "The sign-in request expired or was invalid. Please try again.");
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
          redirect_uri: redirectUri(req),
          grant_type: "authorization_code",
        }),
      });
      if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenRes.status}`);
      const { access_token } = (await tokenRes.json()) as { access_token?: string };
      if (!access_token) throw new Error("No access token returned");

      const infoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!infoRes.ok) throw new Error(`Userinfo failed: ${infoRes.status}`);
      const info = (await infoRes.json()) as GoogleUserInfo;

      if (!info.email || !info.email_verified) {
        deny(res, 403, "Your Google account email is not verified.");
        return;
      }
      if (!isAdminEmail(info.email)) {
        deny(res, 403, "This Google account is not on the ModellerHub admin list.");
        return;
      }

      const openId = `google:${info.sub}`;
      await db.upsertUser({
        openId,
        name: info.name ?? null,
        email: info.email,
        loginMethod: "google",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const token = await createSessionToken({ openId, email: info.email });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_WEEK_MS });
      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[GoogleAuth] Callback failed", error);
      deny(res, 500, "Google sign-in failed. Please try again.");
    }
  });
}
