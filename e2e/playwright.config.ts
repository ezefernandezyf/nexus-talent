import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, "..", "server");
const testDbPath = resolve(serverDir, "test.db");
const e2eSchema = resolve(serverDir, "prisma", "schema.e2e.prisma");
const rootDir = resolve(__dirname, "..");
const databaseUrl = `file:${testDbPath}`;

// Chained command: generate SQLite Prisma client → push schema → start server.
// All three steps share the same DATABASE_URL via the env config below.
const serverCommand = [
  `npx prisma generate --schema="${e2eSchema}"`,
  `npx prisma db push --schema="${e2eSchema}" --accept-data-loss`,
  `pnpm --filter @nexus-talent/server dev`,
].join(" && ");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: "html",
  timeout: 60_000,
  globalSetup: resolve(__dirname, "global-setup.ts"),
  globalTeardown: resolve(__dirname, "global-teardown.ts"),
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: serverCommand,
      port: 3001,
      cwd: serverDir,
      env: {
        DATABASE_URL: databaseUrl,
        NODE_ENV: "test",
        PORT: "3001",
        JWT_SECRET: "e2e-test-secret-key-not-for-production",
      },
    },
    {
      command: "pnpm --filter @nexus-talent/web dev",
      port: 5173,
      cwd: rootDir,
      env: {
        VITE_API_URL: "http://localhost:3001",
      },
    },
  ],
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
