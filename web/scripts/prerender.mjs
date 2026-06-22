/**
 * Build-time prerenderer for / and /privacy pages.
 *
 * 1. Spins up a Vite dev server in SSR mode
 * 2. Loads the renderer module via ssrLoadModule
 * 3. Renders each page to an HTML string
 * 4. Wraps in the index.html template with all GEO tags
 * 5. Writes to dist/ as static HTML files alongside the SPA index.html
 *
 * Run after `vite build`: node scripts/prerender.mjs
 */

import { createServer } from "vite";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const DIST = resolve("dist");
const INDEX_HTML = resolve("index.html");

async function prerender() {
  const server = await createServer({
    configFile: "./vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
  });

  try {
    const template = readFileSync(INDEX_HTML, "utf-8");

    // Load the SSR renderer via Vite's SSR transform
    const { render } = await server.ssrLoadModule("/ssr/renderer.tsx");

    const pages = [
      { path: "/", filename: "landing.html" },
      { path: "/privacy", filename: "privacy.html" },
    ];

    for (const { path, filename } of pages) {
      const appHtml = render(path);

      // Inject the rendered HTML into the template
      let html = template.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`,
      );

      // Let Vite transform (inject asset links, etc.)
      html = await server.transformIndexHtml(path, html);

      // Write to dist/
      const outputPath = resolve(DIST, filename);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, html, "utf-8");

      console.log(`[prerender] ${path} -> ${outputPath}`);
    }

    console.log("[prerender] Complete");
  } finally {
    await server.close();
  }
}

prerender().catch((err) => {
  console.error("[prerender] Failed:", err);
  process.exit(1);
});
