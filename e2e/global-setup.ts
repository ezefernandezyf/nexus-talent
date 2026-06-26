/**
 * Global Playwright setup.
 *
 * The webServer chained command handles Prisma client generation,
 * schema push, and starting the server. This global setup is a
 * no-op — the webServer's chained command is the authoritative
 * setup mechanism for the E2E test database.
 */
export default async function globalSetup(): Promise<void> {
  // All setup is handled by the webServer chained command.
  // This file must exist (referenced in playwright.config.ts)
  // but does not need to perform any actions.
}
