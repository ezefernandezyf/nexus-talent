import { rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Global Playwright teardown.
 *
 * Removes the ephemeral SQLite test database.
 * Does NOT restore the PostgreSQL Prisma client automatically.
 * run `pnpm run prisma:generate` from the server directory after
 * E2E tests if you need the PostgreSQL client.
 */
export default async function globalTeardown(): Promise<void> {
  const serverDir = resolve(__dirname, "..", "server");
  const testDbPath = resolve(serverDir, "test.db");
  const testDbJournal = testDbPath + "-journal";

  if (existsSync(testDbPath)) {
    rmSync(testDbPath);
    console.log("[global-teardown] Removed test database:", testDbPath);
  }
  if (existsSync(testDbJournal)) {
    rmSync(testDbJournal);
  }

  console.log("[global-teardown] Cleanup complete.");
}
