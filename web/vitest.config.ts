import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
  test: {
    forbidOnly: !!process.env.CI,
    environment: "jsdom",
    globals: true,
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 2,
        minForks: 1,
      },
    },
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/core/AppRouter.test.tsx"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    teardownTimeout: 5_000,
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