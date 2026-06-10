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

### Task 1.3: Create Express 5 server skeleton + Dockerfile  ✅
- **Files**: `server/package.json`, `server/tsconfig.json`, `server/src/index.ts`, `server/src/infra/app.ts`, `server/src/infra/prisma.ts`, `server/src/infra/error-handler.ts`, `server/src/infra/logger.ts`, `server/src/infra/validate.ts`, `server/Dockerfile`, `server/.dockerignore`
- **Description**: Create `@nexus-talent/server` with Express 5 app wired up. Infra modules: Prisma singleton, pino logger, Zod validation middleware, global error handler (Zod→400, Prisma→404/409, fallback→500). Mount health check at `GET /api/health`. Create screaming-architecture directories (`auth/`, `analysis/`, `profile/`, `history/`) with empty routers. Add Dockerfile for Render (Node 22 + pnpm + dist).
- **Acceptance**: `pnpm run dev:server` starts on :3001 with pino logs. `GET /api/health` returns `{ status: "ok" }`.
- **Dependencies**: 1.1, 1.2
- **Estimated effort**: M

### Task 1.4: Create Prisma schema  ✅
- **Files**: `server/prisma/schema.prisma`
- **Description**: Define models: `Profile` (id uuid, email unique, displayName?, googleId?, role enum USER/ADMIN, timestamps), `Analysis` (id uuid, userId FK→Profile, description text, result Json, summary?, notes?, timestamps), `Setting` (id uuid, userId FK unique, data Json, timestamps). Use PostgreSQL provider, UUID IDs, `@map` for table names.
- **Acceptance**: `prisma:generate` produces client. `prisma:migrate dev --name init` creates tables in Supabase. Generated types are compatible with shared Zod schemas.
- **Dependencies**: 1.1, 1.3
- **Estimated effort**: M

### Task 1.5: Migrate SPA to web/ package  ✅
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

---

## Phase 2: Auth Backend

### Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–850 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation → PR 2: Core Endpoints → PR 3: OAuth + Tests |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Shared auth schemas + JWT util + rate limiter + parseCookies | PR 1 | Base: develop or tracker. ~200 lines. Foundation. |
| 2 | Auth middleware + service + controller + router + wiring | PR 2 | Depends on PR 1. ~350 lines. Core endpoints. |
| 3 | Google OAuth + auth tests | PR 3 | Depends on PR 2. ~250 lines. OAuth + verification. |

---

### Task 2.1: Create shared auth Zod schemas
- **Files**: `shared/contracts/auth.ts`, `shared/src/index.ts`
- **Description**: Define `LoginSchema` (z.email + password z.string().min(8)), `RegisterSchema` (extends Login + optional displayName), `SessionSchema` (user with id, email, displayName, role). Zod 4 syntax. Barrel export from shared/index.ts.
- **Acceptance**: `pnpm --filter @nexus-talent/shared typecheck` passes. Schemas validate correctly. Web + server can import `@nexus-talent/shared/contracts/auth`.
- **Dependencies**: 1.2
- **Estimated effort**: XS

### Task 2.2: Implement JWT utility with crypto.createHmac
- **Files**: `server/src/infra/http.ts`
- **Description**: `sign(payload, secret, expiresIn)` → HS256 JWT string. `verify(token, secret)` → decoded payload or null. `parseCookies(req)` → `Record<string, string>`. Base64url encoding. 7-day expiry. No jsonwebtoken dependency. Extend Express Request with `userId?: string`.
- **Acceptance**: sign/verify roundtrip works. Expired token returns null. Bad signature returns null. `parseCookies` correctly parses `Cookie` header with multiple values.
- **Dependencies**: 2.1
- **Estimated effort**: M

### Task 2.3: Implement in-memory rate limiter
- **Files**: `server/src/infra/rate-limiter.ts`
- **Description**: Factory `rateLimiter({ windowMs, max })` returning Express middleware. `Map<string, { count, resetAt }>` keyed by IP. Auth config: 5 requests / 15min. Returns 429 with `Retry-After` header when exceeded. Cleanup expired entries on access.
- **Acceptance**: 6th request from same IP within window returns 429. Clean IP passes. Memory clears after window expiry.
- **Dependencies**: 1.3
- **Estimated effort**: S

### Task 2.4: Create auth middleware (requireAuth + optionalAuth)
- **Files**: `server/src/auth/auth.middleware.ts`
- **Description**: `requireAuth` — read `nexus-talent-session` cookie via parseCookies, verify JWT, attach decoded user to `req`. Return 401 if missing/expired/invalid. `optionalAuth` — same but continues silently; `req.userId` stays undefined if no valid JWT.
- **Acceptance**: Protected route returns 401 without cookie, 200 with valid cookie, 401 with expired cookie. OptionalAuth allows access regardless.
- **Dependencies**: 2.2
- **Estimated effort**: S

### Task 2.5: Implement auth service
- **Files**: `server/src/auth/auth.service.ts`
- **Description**: `register(email, password, displayName?)` — bcrypt hash (10 rounds), create Profile via Prisma, sign JWT. `login(email, password)` — find Profile by email, bcrypt verify, sign JWT. Throw typed errors: `ConflictError` for duplicate email, `UnauthorizedError` for bad credentials. `getUserById(id)` for me endpoint.
- **Acceptance**: register creates Profile + returns JWT. register with existing email throws ConflictError. login with correct credentials returns JWT. login with wrong password throws UnauthorizedError.
- **Dependencies**: 2.1, 2.2, 1.4
- **Estimated effort**: M

### Task 2.6: Implement auth controller
- **Files**: `server/src/auth/auth.controller.ts`
- **Description**: `register` — validate body with RegisterSchema, call service.register, Set-Cookie (`httpOnly`, `sameSite=lax`, `path=/`, `maxAge=7d`), return 201 `{ user }`. `login` — same flow, return 200. `me` — fetch user via req.userId, return 200 with session. `logout` — Set-Cookie with `maxAge=0`. Error handling maps service errors to HTTP codes.
- **Acceptance**: All 4 endpoints return correct status, cookie headers, and body per spec scenarios. Duplicate email → 409. Bad password → 401. Valid me → 200 with user object. Logout clears cookie.
- **Dependencies**: 2.5, 2.4
- **Estimated effort**: M

### Task 2.7: Create auth router and wire into app
- **Files**: `server/src/auth/auth.router.ts`, `server/src/infra/app.ts`
- **Description**: Router with `POST /register`, `POST /login`, `GET /me`, `POST /logout`. Apply rate limiter to POST routes (5/15min). Mount at `/api/auth` in app.ts.
- **Acceptance**: `GET /api/auth/me` returns 401 without cookie. All routes respond at correct paths. Rate limiter active on auth POST routes. `pnpm run dev:server` starts without errors.
- **Dependencies**: 2.3, 2.6, 2.4
- **Estimated effort**: S

### Task 2.8: Implement Google OAuth
- **Files**: `server/src/auth/auth.controller.ts`, `server/src/auth/auth.service.ts`, `server/src/auth/auth.router.ts`
- **Description**: `GET /api/auth/google` — validate `GOOGLE_OAUTH_CLIENT_ID` env var, redirect to Google consent URL with PKCE (generate+store code_verifier in session cookie). `GET /api/auth/google/callback` — exchange code via Google token endpoint, find or create Profile by `googleId`, sign JWT, set cookie, redirect to frontend (`/app`). Handle error callback gracefully.
- **Acceptance**: Without `GOOGLE_OAUTH_CLIENT_ID`, Google OAuth route returns 400. Redirect to Google consent has correct params. Callback creates Profile, sets JWT, redirects to frontend. Error callback redirects with `?error=`.
- **Dependencies**: 2.2, 2.5, 2.7
- **Estimated effort**: M

### Task 2.9: Write auth tests
- **Files**: `server/src/__tests__/auth.test.ts`
- **Description**: JWT unit: sign/verify roundtrip, expiry, bad signature, parseCookies. Service unit: register, login, duplicate, bad credentials (mocked Prisma). Integration (supertest): register → 201+cookie, duplicate → 409, login → 200+cookie, bad password → 401, GET /me with/without cookie → 200/401, logout → cookie cleared, rate limiter → 429 after 5 attempts.
- **Acceptance**: `pnpm --filter @nexus-talent/server test` passes all auth tests. Coverage >80% on auth domain.
- **Dependencies**: 2.7, 2.8
- **Estimated effort**: M
