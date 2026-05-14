import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function jsxbinApiPlugin() {
  return {
    name: "toolbox-jsxbin-api",
    configureServer(server) {
      server.middlewares.use("/api/jsxbin", async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        let tempDir;
        try {
          const { source, fileName = "script.jsx" } = await readJsonBody(req);
          if (!source || typeof source !== "string") {
            throw new Error("Missing JSX source");
          }

          tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "toolbox-jsxbin-"));
          const inputPath = path.join(tempDir, fileName.replace(/[^\w.-]/g, "_").replace(/\.jsxbin$/i, ".jsx") || "script.jsx");
          const outputPath = inputPath.replace(/\.[^.]+$/, ".jsxbin");
          await fs.writeFile(inputPath, source, "utf8");

          const jsxbin = require("jsxbin");
          await jsxbin(inputPath, outputPath);
          const compiled = await fs.readFile(outputPath, "utf8");

          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: true, output: compiled }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: false, error: error.message || "JSXBin native compilation failed" }));
        } finally {
          if (tempDir) {
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), jsxbinApiPlugin()]
});
