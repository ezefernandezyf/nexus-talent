#!/usr/bin/env bash
set -e

SERVER_DIR="$(dirname "$0")/../server"
E2E_SCHEMA="$SERVER_DIR/prisma/schema.e2e.prisma"
DB_PATH="$SERVER_DIR/test.db"

export DATABASE_URL="file:${DB_PATH}"

echo "[e2e-setup] Generating SQLite Prisma client..."
cd "$SERVER_DIR" && npx prisma generate --schema="$E2E_SCHEMA"

echo "[e2e-setup] Pushing schema to ephemeral SQLite DB..."
cd "$SERVER_DIR" && npx prisma db push --schema="$E2E_SCHEMA" --accept-data-loss

echo "[e2e-setup] Starting server..."
cd "$SERVER_DIR" && npx tsx src/index.ts
