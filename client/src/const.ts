export { COOKIE_NAME } from "@shared/const";

// Admin sign-in goes through the server, which redirects to Google.
export const getLoginUrl = () => "/api/auth/google";
