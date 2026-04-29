import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDb } from "../db";

async function startServer() {
  // Run DB migrations before starting the server
  const db = await getDb();
  if (db) {
    console.log("[Database] Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[Database] Migrations complete.");
  } else {
    console.warn("[Database] No database connection — skipping migrations.");
  }

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    console.log(`[static] Starting production static file server`);
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "8080");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
