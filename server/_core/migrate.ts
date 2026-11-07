import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "node:path";
import { communityInfo, courses } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Applies any pending SQL migrations from /drizzle on startup, so a fresh
 * Railway database gets its tables automatically and future schema changes
 * deploy with the code. Already-applied migrations are skipped.
 */
export async function runMigrations() {
  const db = await getDb();
  if (!db) return;
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  await migrate(db, { migrationsFolder });
  console.log("[Database] Migrations up to date");
}

/**
 * Inserts starter content only when the site has no courses and no
 * community text yet. Everything here can be edited or deleted in /admin.
 */
export async function seedIfEmpty() {
  const db = await getDb();
  if (!db) return;

  const [existingCourse] = await db.select({ id: courses.id }).from(courses).limit(1);
  const [existingInfo] = await db.select({ id: communityInfo.id }).from(communityInfo).limit(1);
  if (existingCourse || existingInfo) return;

  await db.insert(courses).values({
    titleEn: "AFM Exam Prep: Integrated Three-Statement Model",
    titleAr: "التحضير لاختبار AFM: النموذج المالي المتكامل للقوائم الثلاث",
    descriptionEn:
      "An 8-week online project course. Each week adds one working piece to a single integrated model — historical base, operating forecast, supporting schedules, debt and equity, full integration and checks — ending with an audit, a timed rebuild and an exam-readiness assessment.",
    descriptionAr:
      "دورة مشروع عبر الإنترنت مدتها 8 أسابيع. يضيف كل أسبوع جزءاً عاملاً إلى نموذج متكامل واحد — البيانات التاريخية، التوقعات التشغيلية، الجداول الداعمة، الدين وحقوق الملكية، الربط الكامل والضوابط — وتنتهي بمراجعة للنموذج وإعادة بناء موقوتة وتقييم للجاهزية للاختبار.",
    duration: "8 weeks",
    certification: "Prepares for the FMI Advanced Financial Modeler (AFM) exam",
    level: "advanced",
    featured: 1,
  });

  await db.insert(communityInfo).values({
    key: "mission",
    titleEn: "Our Mission",
    titleAr: "رسالتنا",
    contentEn:
      "Connecting the architects of finance — a professional community dedicated to elevating financial modeling standards.",
    contentAr: "ربط معماريي التمويل — مجتمع مهني مكرّس لرفع معايير النمذجة المالية.",
  });

  console.log("[Database] Starter content inserted");
}
