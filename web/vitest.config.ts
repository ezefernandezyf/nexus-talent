import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/core": resolve(__dirname, "src/core"),
      "@/shared": resolve(__dirname, "src/shared"),
      "@/features": resolve(__dirname, "src/features"),
      "@/test": resolve(__dirname, "src/test"),
    },
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/features/analysis/**/*.{ts,tsx}",
        "src/lib/ai-client.ts",
        "src/schemas/job-analysis.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});