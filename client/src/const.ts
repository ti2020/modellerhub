export { COOKIE_NAME } from "@shared/const";

// Admin sign-in goes through the server, which redirects to Google.
export const getLoginUrl = () => "/api/auth/google";

// Community entry point: the Modeller Hub Telegram bot (registration, announcements, submissions).
export const TELEGRAM_URL = "https://t.me/Modeller_AFM_bot";
