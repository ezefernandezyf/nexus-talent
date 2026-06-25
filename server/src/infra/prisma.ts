import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * PrismaClient singleton.
 *
 * Prisma 7 requires a driver adapter to be passed to the constructor.
 * - PostgreSQL (production/development): uses `@prisma/adapter-pg`
 * - SQLite (E2E tests): uses `@prisma/adapter-libsql`
 *
 * The adapter is selected automatically based on the DATABASE_URL.
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
    "Set it to your PostgreSQL connection string for development/production, " +
    "or to a file: path for E2E tests.",
  );
}

const isSQLite = databaseUrl.startsWith("file:");

const adapter = isSQLite
  ? new PrismaLibSql({ url: databaseUrl })
  : new PrismaPg({ connectionString: databaseUrl });

export const prisma = new PrismaClient({ adapter });
