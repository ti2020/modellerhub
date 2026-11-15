import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path from "node:path";

/**
 * Apply pending SQL migrations from ./drizzle before the server starts.
 * Drizzle records applied migrations, so this is safe to run on every boot.
 */
export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Migrate] DATABASE_URL not set; skipping migrations");
    return;
  }
  const connection = await mysql.createConnection(url);
  try {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    await migrate(drizzle(connection), { migrationsFolder });
    console.log("[Migrate] Database is up to date");
  } finally {
    await connection.end();
  }
}
