# Tasks: V1.1 Backend Migration — Phase 1: Infrastructure

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | pnpm workspace + shared/ + server skeleton + Prisma + web/ migration + e2e scaffold + config | PR 1 | Base: develop. All infra in one PR since pieces must coexist to verify |

---

## Phase 1: Infrastructure

### Task 1.1: Initialize pnpm workspace  ✅
- **Files**: `pnpm-workspace.yaml`, `package.json`, `.gitignore`
- **Description**: Create `pnpm-workspace.yaml` with packages `[server, web, shared, e2e]`. Add workspace scripts (`dev:server`, `dev:web`, `prisma:generate`, `prisma:migrate`, `lint`, `format`, `typecheck`). Update `.gitignore` for monorepo artifacts.
- **Acceptance**: `pnpm install` resolves all packages. `pnpm list -r` shows 4 workspace packages. Each script runs without error.
- **Dependencies**: None
- **Estimated effort**: S

### Task 1.2: Create shared/ package with Zod contracts  ✅
- **Files**: `shared/package.json`, `shared/tsconfig.json`, `shared/src/index.ts`, `shared/src/schemas.ts`
- **Description**: Create `@nexus-talent/shared` with Zod schemas: `authLoginSchema`, `authRegisterSchema`, `authSessionDTOSchema` (auth); `analysisRequestSchema`, `analysisResponseSchema` (analysis); `profileSchema` (profile); `analysisListSchema`, `errorResponseSchema` (common). All schemas in `shared/src/schemas.ts`, barrel re-export from `shared/src/index.ts`.
- **Acceptance**: `pnpm --filter @nexus-talent/shared lint` (tsc --noEmit) passes. Zod schemas validate correctly. Compatible with existing frontend contracts.
- **Dependencies**: 1.1
- **Estimated effort**: M

### Task 1.3: Create Express 5 server skeleton + Dockerfile
- **Files**: `server/package.json`, `server/tsconfig.json`, `server/src/index.ts`, `server/src/infra/app.ts`, `server/src/infra/prisma.ts`, `server/src/infra/error-handler.ts`, `server/src/infra/logger.ts`, `server/src/infra/validate.ts`, `server/Dockerfile`, `server/.dockerignore`
- **Description**: Create `@nexus-talent/server` with Express 5 app wired up. Infra modules: Prisma singleton, pino logger, Zod validation middleware, global error handler (Zod→400, Prisma→404/409, fallback→500). Mount health check at `GET /api/health`. Create screaming-architecture directories (`auth/`, `analysis/`, `profile/`, `history/`) with empty routers. Add Dockerfile for Render (Node 22 + pnpm + dist).
- **Acceptance**: `pnpm run dev:server` starts on :3001 with pino logs. `GET /api/health` returns `{ status: "ok" }`.
- **Dependencies**: 1.1, 1.2
- **Estimated effort**: M

### Task 1.4: Create Prisma schema
- **Files**: `server/prisma/schema.prisma`
- **Description**: Define models: `Profile` (id uuid, email unique, displayName?, googleId?, role enum USER/ADMIN, timestamps), `Analysis` (id uuid, userId FK→Profile, description text, result Json, summary?, notes?, timestamps), `Setting` (id uuid, userId FK unique, data Json, timestamps). Use PostgreSQL provider, UUID IDs, `@map` for table names.
- **Acceptance**: `prisma:generate` produces client. `prisma:migrate dev --name init` creates tables in Supabase. Generated types are compatible with shared Zod schemas.
- **Dependencies**: 1.1, 1.3
- **Estimated effort**: M

### Task 1.5: Migrate SPA to web/ package
- **Files**: `web/package.json`, `web/tsconfig.json`, `web/vite.config.ts`, `web/src/*` (moved from `src/`)
- **Description**: Create `@nexus-talent/web` with React 19 deps. Move `src/` → `web/src/` preserving internal structure. Configure Vite with proxy `:5173/api/*` → `:3001/api/*`, Tailwind plugin, React plugin. Update TypeScript paths. Update import paths that referenced root-level files.
- **Acceptance**: `pnpm run dev:web` starts Vite on :5173. App renders without import errors. `fetch("/api/health")` from browser proxies to :3001.
- **Dependencies**: 1.1
- **Estimated effort**: L

### Task 1.6: Create e2e/ scaffold  ✅
- **Files**: `e2e/package.json`, `e2e/tsconfig.json`, `e2e/playwright.config.ts`, `e2e/tests/smoke.spec.ts`
- **Description**: Create `@nexus-talent/e2e` package with Playwright dependency, config, tsconfig, and smoke test.
- **Acceptance**: `pnpm install` resolves e2e package. `pnpm --filter @nexus-talent/e2e exec playwright --version` outputs version. Smoke test structure is in place.
- **Dependencies**: 1.1
- **Estimated effort**: XS

### Task 1.7: Update project config files
- **Files**: `env.example`, `AGENTS.md`
- **Description**: Update `env.example` with server vars (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_OAUTH_CLIENT_ID`). Remove `VITE_GROQ_API_KEY`. Update `AGENTS.md` to reflect monorepo structure, pnpm commands, and new key files.
- **Acceptance**: `env.example` covers all required vars for dev. `AGENTS.md` correctly documents monorepo, scripts, and architecture.
- **Dependencies**: 1.1–1.6
- **Estimated effort**: S

---

## REVIEW

- **Estimated total changed lines**: ~350–420 (P1). New files: server skeleton (~180), shared contracts (~90), web migration (~50 net after move), configs (~50). Well within the 400-line budget but close due to schema + contracts size.
- **Risk assessment**: Medium — Prisma schema + Zod contracts are dense but formulaic. Web migration is a `git mv` with import path updates. If git doesn't detect renames cleanly, the diff could exceed 400 lines. Recommended: single PR to `develop` with squash-merge.
- **Testing approach**: No integration tests in P1 (server has no business logic yet). Verify with: `pnpm install` (resolution), `pnpm run dev:server` (starts, health check OK), `pnpm run dev:web` (Vite proxying), `pnpm run typecheck` (both packages compile), `pnpm run prisma:generate` (client generated).
