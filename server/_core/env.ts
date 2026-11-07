/**
 * All runtime configuration comes from environment variables.
 * On Railway, set these under the service's "Variables" tab.
 * Locally, copy .env.example to .env and fill it in.
 */
const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);

export const ENV = {
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000", 10),

  /** MySQL connection string. On Railway: ${{MySQL.MYSQL_URL}} */
  databaseUrl: process.env.DATABASE_URL ?? "",

  /** Long random string used to sign login sessions. */
  sessionSecret: process.env.JWT_SECRET ?? "",

  /** Google OAuth client (Google Cloud Console → APIs & Services → Credentials). */
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

  /**
   * Public base URL of the site, e.g. https://modellerhub.up.railway.app
   * Used to build the Google redirect URL. Falls back to the request host.
   */
  publicUrl: (process.env.PUBLIC_URL ?? "").replace(/\/+$/, ""),

  /** Comma-separated Google emails that get admin rights on sign-in. */
  adminEmails: list(process.env.ADMIN_EMAILS),
};

export function assertProductionEnv() {
  if (!ENV.isProduction) return;
  const missing = [
    ["DATABASE_URL", ENV.databaseUrl],
    ["JWT_SECRET", ENV.sessionSecret],
    ["GOOGLE_CLIENT_ID", ENV.googleClientId],
    ["GOOGLE_CLIENT_SECRET", ENV.googleClientSecret],
    ["ADMIN_EMAILS", ENV.adminEmails.join(",")],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (ENV.sessionSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
}
