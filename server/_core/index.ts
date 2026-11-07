import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createServer } from "http";
import { appRouter } from "../routers";
import { registerAuthRoutes } from "./auth";
import { createContext } from "./context";
import { assertProductionEnv, ENV } from "./env";
import { runMigrations, seedIfEmpty } from "./migrate";
import { serveStatic } from "./static";

async function startServer() {
  assertProductionEnv();

  if (ENV.databaseUrl) {
    await runMigrations();
    await seedIfEmpty();
  } else {
    console.warn("[Database] DATABASE_URL not set — running without a database.");
  }

  const app = express();
  // Railway (and most hosts) terminate HTTPS at a proxy in front of the app.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  registerAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  const server = createServer(app);
  if (process.env.NODE_ENV === "development") {
    // Loaded only in development so production never needs Vite installed.
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(ENV.port, "0.0.0.0", () => {
    console.log(`Server running on port ${ENV.port}`);
  });
}

startServer().catch(error => {
  console.error("[Startup] Fatal error:", error);
  process.exit(1);
});
