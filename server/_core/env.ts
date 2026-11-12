const parseList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  /** Public origin of the site, e.g. https://modellerhub.up.railway.app (no trailing slash). */
  publicUrl: (process.env.PUBLIC_URL ?? "").replace(/\/+$/, ""),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  /** Comma-separated Google account emails allowed into the admin side. */
  adminEmails: parseList(process.env.ADMIN_EMAILS),
};

export const isAdminEmail = (email: string | null | undefined) =>
  !!email && ENV.adminEmails.includes(email.trim().toLowerCase());
