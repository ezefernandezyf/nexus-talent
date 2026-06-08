# Proposal: V1.1 Backend Migration

## Intent

Nexus Talent is a pure SPA with 4 critical issues blocking portfolio-readiness:

1. **XSS vulnerability**: Supabase Auth stores JWT in localStorage — accessible to any injected script
2. **Exposed API key**: `VITE_GROQ_API_KEY` in client bundle — anyone can extract it
3. **Volatile history**: localStorage-only — lost on browser clear, no cross-device sync
4. **No backend architecture**: all AI calls, auth, and data access happen client-side

V1.1 introduces a Node.js backend (Express 5) with screaming architecture, httpOnly cookie auth, server-side AI orchestration, and PostgreSQL persistence — mirroring the proven echolog architecture.

## Scope

### In Scope
- **Backend**: Express 5 + TypeScript, screaming architecture (domain-top-level dirs)
- **Auth**: Custom JWT (HS256) in httpOnly cookies, email/password + Google OAuth
- **API**: REST under `/api/*` with rate limiting, structured logging (pino), CSP (helmet)
- **DB**: Supabase PostgreSQL via Prisma, schema for profiles + analyses + settings
- **Shared contracts**: Zod schemas in `shared/contracts/` — single source of truth
- **AI orchestration**: Groq calls moved server-side, proxied through `/api/ai/analyze`
- **History migration**: localStorage → PostgreSQL, repository pattern preserved
- **E2E tests**: Playwright test suite
- **Deploy config**: Backend on Render, frontend on Vercel
- **New design identity**: 2-3 visual directions proposed for user to choose

### Out of Scope
- GitHub / LinkedIn OAuth (deferred)
- Real-time features (WebSockets)
- Email service / transactional emails
- Admin panel / dashboard
- Multi-tenant workspace model
- File upload / resume parsing
- Mobile app

## Capabilities

### New Capabilities
- `backend-api`: Express 5 REST server with screaming architecture (domains: auth, analysis, profile, history)
- `shared-contracts`: Zod schemas shared between server and client (`shared/contracts/`)
- `api-auth`: Custom JWT middleware with httpOnly cookies + CSRF protection
- `ai-proxy`: Server-side Groq API calls, client sends job description only
- `e2e-tests`: Playwright suite for critical user flows

### Modified Capabilities
- `auth`: Supabase Auth SDK removed from client → custom JWT in httpOnly cookies; Supabase OAuth used only for identity verification
- `persistence`: localStorage repository replaced by Prisma + PostgreSQL; repository interface preserved
- `history`: Backend-backed CRUD via `/api/analyses`; same UI contracts retained
- `ai-orchestrator`: Client calls `/api/ai/analyze` instead of direct Groq; same Zod-validated response shape

## Approach

**Slice-based monorepo migration** — no big-bang rewrite. Each slice is a feature branch → `develop` → `main` when V1.1 is ready.

1. **Infrastructure**: Create `server/`, `shared/` in pnpm workspace, Prisma schema, Dockerfile
2. **Auth**: Custom JWT flow + Supabase OAuth verification + httpOnly cookie wiring
3. **AI Proxy**: Move Groq calls server-side, preserve existing client API shape
4. **History API**: CRUD endpoints for analyses, replace localStorage with Prisma
5. **Frontend refactor**: Swap auth provider, API client, and repository implementations
6. **Design identity lock**: User picks a direction → implement globally
7. **E2E + Polish**: Playwright tests, security audit, deploy scripts

## Phased Roadmap

| Phase | Slice | Deliverable | Est. Lines |
|-------|-------|-------------|------------|
| **P1** | Infrastructure | pnpm monorepo, Prisma schema, Express 5 skeleton, Render deploy config | ~350 |
| **P2** | Auth backend | Custom JWT (HS256), email/password + Google OAuth, middleware, migration script | ~400 |
| **P3** | AI Proxy | `/api/ai/analyze` endpoint, Groq SDK server-side, Zod validation, error handling | ~250 |
| **P4** | History API | CRUD `/api/analyses`, Prisma queries, repository adapter for frontend | ~300 |
| **P5** | Frontend refactor | Swap AuthProvider, API client, remove localStorage, wire react-query to backend | ~400 |
| **P6** | Design identity | User-chosen direction applied: palette, typography, tokens, global styles | ~350 |
| **P7** | E2E + Security | Playwright flows (auth, analysis, history), CSP audit, rate limiting, helmet | ~350 |
| **P8** | Polish + Deploy | Error boundaries, skeleton states, Vercel rewrites, Render health check, docs | ~200 |

### Chained PR strategy
- P1→P2→P3 can chain (each adds backend surface)
- P5 (frontend refactor) is highest-risk — expect 400+ lines
- P6 (design) is CSS-only — safe as single PR

## AGENTS.md Structure (mirroring echolog)

```markdown
# Nexus Talent — Agent Context

## Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind 4 + React Router 7
- **Backend**: Node.js + Express 5 + TypeScript + Prisma (Supabase PostgreSQL)
- **State**: React Query (server) + Zustand (UI)
- **Auth**: Custom JWT in httpOnly cookies (no localStorage)
- **Validation**: Zod (shared contracts in `shared/contracts/`)
- **Testing**: Vitest (server + web), Playwright (E2E)
- **Package Manager**: pnpm (workspace monorepo)

## Architecture
- **Screaming architecture**: business domains as top-level dirs in `server/src/`
- **Monorepo**: `server/`, `web/`, `shared/` — each `"type": "module"`
- **API**: REST JSON under `/api/*`, Express routers with controller-service-prisma layers

## Conventions
- Conventional Commits: `feat(scope):`, `fix(scope):`, `chore:` — title EN, desc ES
- React 19: no useMemo/useCallback, named imports only
- TypeScript: strict, never `any`, `as const` pattern

## Git Workflow
1. Feature branches from `develop`, PR → develop → main for V1.1 release
2. Branch naming: `feat/short-name`, `fix/short-name`
3. Atomic commits, lint + type-check before push

## How to Run
```bash
pnpm install
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run dev:server   # :3001
pnpm run dev:web      # :5173
```

## Key Files
- `server/prisma/schema.prisma` — data model
- `server/src/infra/app.ts` — Express + route wiring
- `server/src/auth/auth.middleware.ts` — JWT cookie → req.userId
- `shared/contracts/` — Zod schemas
- `web/src/core/api-client.ts` — Axios + `/api` proxy
- `web/vite.config.ts` — Vite + API proxy to :3001

## Roadmap
(See Phased Roadmap above — P1 through P8)
```

## Design Exploration: 3 Aesthetic Directions

The user wants a NEW visual identity (not echolog's portfolio-personality), but using portfolio-personality **principles** to avoid AI-generated look.

### Option A: "The Terminal" — Cyber-Teal + Amber

| Aspect | Value |
|--------|-------|
| **Palette** | Teal primary `#00D4AA`, Amber accent `#FFB347`, Deep Navy base `#0A0E27`, Warm white text `#EAE8E3` |
| **Typography** | JetBrains Mono (display/technical), IBM Plex Sans (body) |
| **Vibe** | High-signal, low-noise. Feels like a mission-control dashboard. Terminal-inspired but editorial. Glowing accent elements for CTAs. Dark-first with a high-contrast light mode (warm cream background). |
| **Why** | Fits "precision instrument" principle. Genuine developer aesthetic, recycled from no template. |

### Option B: "The Studio" — Coral + Slate

| Aspect | Value |
|--------|-------|
| **Palette** | Coral primary `#FF6B6B`, Slate secondary `#6C7A89`, Warm Charcoal base `#1A1D23`, Off-white `#F5F0EB` |
| **Typography** | Satoshi (display), Inter (body) — same pairing as echolog's principles |
| **Vibe** | Warm, human, creative. Coral brings energy without being aggressive. Soft shadows, generous whitespace, card-based layouts. Light mode feels like a design portfolio. |
| **Why** | Stands out from cold SaaS. Accessible (coral/slate passes WCAG AA on dark). Portfolio-friendly for a junior dev. |

### Option C: "The Signal" — Indigo + Chartreuse

| Aspect | Value |
|--------|-------|
| **Palette** | Indigo primary `#6366F1`, Chartreuse accent `#B3E762`, Neutral deep base `#111118`, Cool grey text `#D4D4D8` |
| **Typography** | Clash Display (headings), Satoshi (body) — editorial contrast |
| **Vibe** | Bold, modern, slightly experimental. Indigo anchors trust; chartreuse adds unexpected pop. Asymmetric layouts, large type, generous negative space. Dark mode with subtle glass panels. |
| **Why** | Breaks SaaS conventions while remaining professional. The accent color forces deliberate design choices — impossible to get an "AI template" look. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `/` | Modified | pnpm workspace root, new `pnpm-workspace.yaml` |
| `package.json` | Modified | Root orchestrates workspace; `web/` gets its own |
| `src/lib/supabase/` | Removed | Supabase client replaced by custom auth in backend |
| `src/lib/ai-client.ts` | Modified | Calls `/api/ai/analyze` instead of direct Groq |
| `src/lib/repositories/` | Modified | Swaps localStorage for HTTP calls |
| `src/features/auth/` | Modified | New provider using httpOnly cookie session |
| `src/features/history/` | Modified | Backend-backed persistence |
| `vite.config.ts` | Modified | API proxy to `:3001` |
| `env.example` | Modified | No `VITE_GROQ_API_KEY`; add backend vars |
| `server/` | **New** | Express 5 + Prisma + screaming architecture |
| `shared/` | **New** | Zod contracts monorepo package |
| `AGENTS.md` | Modified | Updated architecture, run commands, key files |
| `.github/` | Modified | CI for monorepo (lint, type, test) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth migration breaks sessions for existing users | Medium | Deploy backend first; keep Supabase SDK as fallback during P1-P2; old JWT in localStorage can be exchanged for httpOnly cookie |
| Groq API format changes | Low | Zod validation on response — same protection as today; tests catch shape drift |
| Frontend refactor (P5) exceeds 400-line budget | High | Chain PRs: P5a (auth swap), P5b (API client swap), P5c (repository swap) |
| Design identity changes feel inconsistent mid-migration | Low | Design lock (P6) happens after all feature work — single visual sweep |
| Playwright infra adds CI complexity | Medium | Start with 3 smoke tests; expand in parallel with feature work |

## Rollback Plan

1. **Per-slice rollback**: Each slice is a feature branch into `develop` — revert the PR to roll back
2. **Full rollback**: Reset `develop` to commit before P1 started (tagged as `pre-v1.1-backend`)
3. **Data**: Existing data can be dropped (user confirmed) — no migration reversal needed
4. **Env vars**: Keep `VITE_GROQ_API_KEY` and `VITE_SUPABASE_*` in Vercel during migration; if backend fails, frontend still works as standalone SPA
5. **Deploy**: Render deploy is additive — Vercel continues serving the SPA; backend being down means auth/history fail gracefully (user sees error states, not breakage)

## Dependencies

- Node.js 22 (already in `.nvmrc`)
- Supabase PostgreSQL instance (existing)
- Groq API key (existing, moved server-side)
- pnpm (to be installed globally or via corepack)
- Render account (user already uses Vercel)

## Success Criteria

- [ ] No `VITE_GROQ_API_KEY` in client bundle — AI calls go through backend
- [ ] Auth uses httpOnly cookies — no JWT in localStorage, no XSS token leak
- [ ] Analysis history persists across browser clears and devices
- [ ] All existing frontend tests pass without modification (Vitest)
- [ ] Playwright E2E covers: login, signup, run analysis, view history, logout
- [ ] Backend deploys on Render with health check passing
- [ ] Lighthouse 95+ on landing and analysis pages
- [ ] User picks one design direction and it's applied globally
