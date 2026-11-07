import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";

/** Serves the built React app (dist/public) in production. */
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use(express.static(distPath, { index: false, maxAge: "1h" }));

  // Unknown /api routes are real 404s; everything else is handled by the React router.
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
