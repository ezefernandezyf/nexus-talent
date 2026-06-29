# Design: V1.1 Backend Migration

## Technical Approach

Slice-based monorepo migration: extract the current SPA (`src/`) into a pnpm workspace (`web/`, `server/`, `shared/`, `e2e/`). The server implements screaming-architecture REST under `/api/*` with custom HS256 JWT in httpOnly cookies, server-side Groq proxy, and Prisma-backed CRUD. The web layer preserves its existing repository interfaces and UI contracts - swapping localStorage/Supabase SDK for HTTP calls and auth cookie flows.

## Architecture Decisions

### Decision: Custom JWT vs `jsonwebtoken`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `jsonwebtoken` npm | + standard, - extra dep for HS256 | **Rejected** |
| `crypto.createHmac` | + zero deps, - need manual verify | **Selected** - HS256 is simple enough; one `jwt.ts` file with sign/verify/parseCookies is lighter and auditable |

### Decision: Screaming Architecture vs layered

| Option | Tradeoff | Decision |
|--------|----------|----------|
| routes/controllers/services/ | familiar, but scatters a domain across 4 dirs | **Rejected** |
| auth/, analysis/, profile/, history/ | each domain is self-contained; infra/ for shared concerns | **Selected** - mirrors the existing pattern in the codebase's AGENTS.md |

### Decision: HTTP-only cookies vs localStorage + Authorization header

| Option | Tradeoff | Decision |
|--------|----------|----------|
| localStorage + `Authorization: Bearer` | XSS-vulnerable (current state) | **Rejected** |
| httpOnly cookie | immune to XSS, sent automatically by browser, requires CSRF protection | **Selected** - `sameSite: lax` + CSP covers the CSRF vector for this API surface |

### Decision: Zod schemas in shared package vs duplicated

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Each side duplicates | + independent, - drift guaranteed | **Rejected** |
| `shared/contracts/` as single truth | + no drift, server validates input, web infers types, - one more workspace package | **Selected** - already the pattern in current validation layer; move `src/schemas/` + `src/lib/validation/` to `shared/contracts/` |

### Decision: Zustand vs React Context for auth state

| Option | Tradeoff | Decision |
|--------|----------|----------|
| React Context (current) | re-renders all consumers on any change, no devtools | **Replaced** |
| Zustand store | fine-grained subscriptions, devtools, simple API | **Selected** - already used for UI state; auth state (`session`, `status`) maps naturally to a store |

### Decision: Design identity

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Current "Precision Instrument" | dark/teal/Inter | **Replaced** by proposal's Option C |
| "The Signal" - Indigo + Chartreuse | bold, breaks SaaS conventions, editorial typography | **User-selected** in proposal. CSS variables replace hardcoded colors |

## Data Flow

```
Web (pnpm:web)                    Server (pnpm:server)              External
─────────────────                 ─────────────────────             ────────

[AuthProvider mount]
  GET /api/auth/me ──────────→ requireAuth middleware
                                  JWT cookie → verifyToken
                                  ← 200 { user } or 401

[Login form]
  POST /api/auth/login ──────→ auth.controller
                                  bcrypt verify → JWT → Set-Cookie
                                  ← 200 { user }

[Analysis page]
  POST /api/ai/analyze ──────→ analysis.controller
                                  Zod validate input
                                  Groq SDK (server-side) ───→ Groq API
                                  Zod validate response      ← parsed result
                                  ← 200 { analysis }

[History list]
  GET /api/analyses?page=1 ──→ history.controller
                                  Prisma: paginated query
                                  ← 200 { items, total, page, pageSize }
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `pnpm-workspace.yaml` | Create | Workspace root with `web/`, `server/`, `shared/`, `e2e/` |
| `package.json` | Modify | Root orchestrates workspaces; remove source deps |
| `server/package.json` | Create | Express 5, Prisma, Groq SDK, Zod, pino, helmet, bcrypt |
| `server/prisma/schema.prisma` | Create | profiles, analyses, settings models |
| `server/src/infra/app.ts` | Create | Express app + middleware chain + route wiring |
| `server/src/infra/prisma.ts` | Create | PrismaClient singleton |
| `server/src/infra/http.ts` | Create | JWT sign/verify/parseCookies (crypto.createHmac) |
| `server/src/infra/error-handler.ts` | Create | Global error handler, Zod→HTTP, Prisma→HTTP mapper |
| `server/src/infra/rate-limiter.ts` | Create | In-memory rate limiter (auth 5/15min, analysis) |
| `server/src/infra/logger.ts` | Create | Pino logger |
| `server/src/infra/validate.ts` | Create | Zod validation middleware factory |
| `server/src/auth/` (4 files) | Create | auth.router, auth.controller, auth.service, auth.middleware |
| `server/src/analysis/` (3 files) | Create | analysis features (controller, service, router) |
| `server/src/profile/` (3 files) | Create | profile features (controller, service, router) |
| `server/src/history/` (3 files) | Create | history features (controller, service, router) |
| `server/Dockerfile` | Create | Node 22, pnpm, dist |
| `shared/package.json` | Create | `@nexus-talent/shared` with Zod + types |
| `shared/contracts/schemas.ts` | Create | All Zod schemas (moved from `src/schemas/` + `src/lib/validation/`) |
| `shared/contracts/auth.ts` | Create | Login/Register/Session schemas |
| `shared/contracts/analysis.ts` | Create | Analysis input/result schemas |
| `shared/contracts/profile.ts` | Create | Profile schemas |
| `shared/contracts/common.ts` | Create | Pagination, error response DTOs |
| `web/package.json` | Create | React 19, no Supabase SDK, no Groq key |
| `web/vite.config.ts` | Create | API proxy to `:3001` |
| `web/src/core/api-client.ts` | Create | Axios with `withCredentials: true` |
| `web/src/auth/auth-store.ts` | Create | Zustand store: session + status |
| `web/src/auth/auth-guard.tsx` | Create | ProtectedRoute + PublicRoute |
| `web/src/auth/auth-provider.tsx` | Create | On mount: GET /api/auth/me → store |
| `e2e/` | Create | Playwright test suite |
| `src/` | Remove | All old SPA code (migrated to `web/`) |
| `AGENTS.md` | Modify | Update to reflect new architecture |
| `DESIGN.md` | Modify | Replace with "The Signal" design tokens |
| `env.example` | Modify | Remove VITE_GROQ_API_KEY, add server env vars |
| `.github/workflows/ci.yml` | Modify | Monorepo CI (lint, type, test server+web) |

## Interfaces / Contracts

```typescript
// shared/contracts/auth.ts
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
export const RegisterSchema = LoginSchema.extend({
  displayName: z.string().trim().max(120).optional(),
});
export const SessionSchema = z.object({
  user: z.object({ id: z.string().uuid(), email: z.string().email(), displayName: z.string().nullable() }),
});

// shared/contracts/common.ts
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), total: z.number(), page: z.number(), pageSize: z.number() });
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit - Zod schemas | All shared contracts validate correctly | Vitest + `safeParse` - migrate existing zod tests |
| Unit - JWT | sign/verify roundtrip, expired token, bad signature | Vitest with `vi.advanceTimersByTime` |
| Unit - Services | auth.register (bcrypt + prisma), analysis orchestration | Vitest + mocked Prisma client |
| Integration - API | Every endpoint: 200, 400, 401, 404, 429 | Supertest against Express app (no auth mock) |
| E2E - Playwright | Auth: register, login, logout, OAuth (mocked) | Playwright with ephemeral test db per run |

## Migration / Rollout

**Phase P1-P4 (backend)**: Deploy server to Render. Frontend still connects via Supabase SDK + localStorage. No breaking changes - the SPA keeps working as-is. **Phase P5 (frontend)**: Swap auth provider + repositories in one deploy. At this point, localStorage data is abandoned (user confirmed in proposal). Rollback per slice: revert the feature branch PR. Full rollback: reset `develop` to tag `pre-v1.1-backend`.

## Open Questions

- [ ] Google OAuth: use `arctic` library or manual PKCE flow? `arctic` preferred (type-safe, maintained) but need to verify Node 22 compat
- [ ] Rate limiter: in-memory vs Redis? In-memory is sufficient for single-instance MVP; document Redis upgrade path
