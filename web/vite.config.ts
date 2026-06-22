import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

/**
 * SSR-capable prerenderer for / and /privacy pages.
 * During dev (vite dev), intercepts requests and server-renders React to HTML.
 * During build, pre-renders static HTML files for deployment.
 */
function ssrPlugin(): Plugin {
  return {
    name: "nexus-ssr",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url ? new URL(req.url, "http://localhost").pathname : "/";

        if (pathname !== "/" && pathname !== "/privacy") {
          return next();
        }

        try {
          const fs = await import("node:fs");
          const path = await import("node:path");
          const templatePath = path.resolve("index.html");
          let template = fs.readFileSync(templatePath, "utf-8");

          const { render } = await server.ssrLoadModule("/ssr/renderer.tsx");
          const appHtml = render(pathname);

          const rootPattern = '<div id="root"></div>';
          if (!template.includes(rootPattern)) {
            console.error("[SSR] Template missing #root placeholder:", template.substring(0, 200));
            return next();
          }

          template = template.replace(
            rootPattern,
            `<div id="root">${appHtml}</div>`,
          );

          template = await server.transformIndexHtml(req.url || "/", template);

          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(template);
        } catch (e) {
          console.error("[SSR] Render failed:", e);
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ssrPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
