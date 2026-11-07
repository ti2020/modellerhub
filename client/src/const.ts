export { COOKIE_NAME, TELEGRAM_URL } from "@shared/const";

/** Starts Google sign-in; the server redirects to Google and back. */
export const getLoginUrl = () => "/api/auth/google";
