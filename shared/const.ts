export const COOKIE_NAME = "app_session_id";
/** Admin sessions last 30 days, then Google sign-in is required again. */
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

/** Public Telegram entry point for Modeller Hub (the course bot). */
export const TELEGRAM_URL = "https://t.me/Modeller_AFM_bot";
