export { COOKIE_NAME } from "@shared/const";

// Admin sign-in goes through the server, which redirects to Google.
export const getLoginUrl = () => "/api/auth/google";

// Community entry point: the Modeller Hub Telegram bot (announcements, submissions).
export const TELEGRAM_URL = "https://t.me/Modeller_AFM_bot";

// Registration goes through SME (Subject Matter Experts Center): WhatsApp line, also takes calls.
export const REGISTER_LOCATION_URL = "https://maps.app.goo.gl/bmsSygEc9rQG5j899";
export const REGISTER_PHONE = "+201100808651";
const registerText = {
  en: "Hello, I would like to register for the AFM Integrated Three-Statement Model course (Batch 1 · Sun).",
  ar: "السلام عليكم، أرغب في التسجيل في دورة نموذج القوائم المالية الثلاث المتكاملة AFM (الدفعة 1 · الشمس).",
};
export const registerWhatsAppUrl = (lang: "en" | "ar") =>
  `https://wa.me/${REGISTER_PHONE.replace("+", "")}?text=${encodeURIComponent(registerText[lang])}`;
export const REGISTER_CALL_URL = `tel:${REGISTER_PHONE}`;
