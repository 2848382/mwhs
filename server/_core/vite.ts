import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use import.meta.url to get the absolute path of the bundled file.
  // After esbuild bundles server/_core/index.ts to dist/index.js, this file
  // lives at <app-root>/dist/index.js. We navigate up two levels from the
  // bundled file's directory (dist/) to reach the app root, then resolve to
  // dist/public from there.
  const bundledFileUrl = new URL(import.meta.url);
  const bundledFilePath = bundledFileUrl.pathname;
  // bundledFilePath is e.g. /app/dist/index.js — go up one level to get dist/,
  // then up one more to get the app root.
  const appRoot = path.resolve(path.dirname(bundledFilePath), "..");
  const distPath = path.resolve(appRoot, "dist", "public");

  console.log(`[serveStatic] import.meta.url: ${import.meta.url}`);
  console.log(`[serveStatic] bundledFilePath: ${bundledFilePath}`);
  console.log(`[serveStatic] appRoot: ${appRoot}`);
  console.log(`[serveStatic] Resolved distPath: ${distPath}`);
  console.log(`[serveStatic] Directory exists: ${fs.existsSync(distPath)}`);

  if (!fs.existsSync(distPath)) {
    console.error(
      `[serveStatic] ERROR: Build directory not found: ${distPath}. ` +
        `Run the client build (e.g. "vite build") before starting the server in production mode.`
    );
    return;
  }

  console.log(`[serveStatic] Directory confirmed, registering static middleware`);

  // Log all incoming requests to help diagnose 404s
  app.use((req, _res, next) => {
    console.log(`[serveStatic] Incoming request: ${req.method} ${req.url}`);
    next();
  });

  // Explicitly serve index.html for the root path before express.static()
  app.get("/", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`[serveStatic] Serving index.html for root path: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[serveStatic] Failed to send index.html: ${err.message}`);
        res.status(500).end("Internal Server Error");
      }
    });
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[serveStatic] Failed to send index.html for fallback: ${err.message}`);
        res.status(500).end("Internal Server Error");
      }
    });
  });
}
