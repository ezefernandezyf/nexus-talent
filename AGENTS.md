# Nexus Talent — Agent Context

> AI-assisted precision recruiting app. Transform a job description into a structured summary, skills matrix, and recruiter-winning outreach.

## Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind 4 + React Router 7
- **Backend**: Node.js + Express 5 + TypeScript + Prisma (Supabase PostgreSQL)
- **State**: React Query (server) + Zustand (UI)
- **Auth**: Custom JWT in httpOnly cookies (no localStorage)
- **Validation**: Zod (shared contracts in `shared/contracts/`)
- **Testing**: Vitest (server + web), Playwright (E2E)
- **AI**: Groq API (server-side proxy, never exposed to client)
- **Lint/Format**: ESLint 9 flat config + Prettier
- **Package Manager**: pnpm (workspace monorepo via `pnpm-workspace.yaml`)

## Architecture
- **Full Screaming Architecture**: business domains are top-level folders in `server/src/`
- **Monorepo**: `server/`, `web/`, `shared/`, `e2e/` — each has its own `package.json` with `"type": "module"`
  - `@nexus-talent/web` — React 19 frontend (migrated from current `src/`)
  - `@nexus-talent/server` — Express 5 backend with screaming architecture
  - `@nexus-talent/shared` — Zod schemas, types, and utilities shared front/back
  - `@nexus-talent/e2e` — Playwright end-to-end tests
- **API**: REST JSON under `/api/*`, Express routers with controller-service-prisma layers
- **Database**: Prisma with Supabase PostgreSQL
- **Auth**: Custom HS256 JWT in httpOnly cookies (inmune a XSS), email/password + Google OAuth
- **AI Proxy**: Server-side Groq calls — client sends only the JD, API key stays on the server
- **Design System**: "The Signal" — Indigo / Chartreuse palette, Clash Display + Satoshi typography

### Flujo de Datos Obligatorio
```
Input Usuario -> Validación Zod (shared) -> Request API -> Server validation ->
Groq API -> Response IA -> Zod validation -> Response al frontend -> Render
```

## Conventions
- Conventional Commits: `feat(scope):`, `fix(scope):`, `chore:`, `docs:`, `test(scope):` — **título en inglés, descripción en español**
- React 19: no useMemo/useCallback (compiler handles it), named imports only
- TypeScript: strict mode, never `any`, `as const` pattern for string literals
- Never build after changes, never add "Co-Authored-By" to commits
- ESLint + Prettier run on every change: `pnpm run lint` / `pnpm run format`
- Zod: Shared schemas in `shared/contracts/` are the single source of truth — server validates input, web infers types
- **No-Line Rule**: No solid 1px borders. Separate by background contrast or ghost borders.
- **UX States**: Every async process must have Loading, Success, Error, and Empty states.
- Cero sobreingeniería. Cero complejidad sin justificación explícita. "Clear over clever."

## Git Workflow (STRICT — zero exceptions)
1. **Develop branch**: `develop` is the integration branch for V1.1. All feature branches merge here.
2. **Feature branches**: EVERY task starts on a new branch from `develop`
3. **Branch naming**: `feat/short-name`, `fix/short-name`, `chore/short-name`
4. **Atomic commits**: one logical change layer per commit, conventional format
5. **Push + PR + Merge**: push branch, create PR to `develop`, squash-merge
6. **V1.1 Release**: `develop` → PR to `main` when all phases are done
7. **Clean working tree**: no untracked files, no WIP before PR
8. **Lint before push**: `pnpm run lint && pnpm run format` must pass
9. **Tests before merge**: `pnpm test` (server + web) must pass

## How to Run
```bash
pnpm install                    # installs all workspace deps
pnpm run prisma:generate        # generate Prisma client
pnpm run prisma:migrate         # run migrations
pnpm run dev:server             # terminal 1: backend on :3001
pnpm run dev:web                # terminal 2: frontend on :5173
```

## Key Files
- `server/prisma/schema.prisma` — data model
- `server/prisma.config.ts` — Prisma 7 datasource config (env DATABASE_URL)
- `server/src/infra/app.ts` — Express app + route wiring
- `server/src/infra/prisma.ts` — Prisma singleton
- `server/src/infra/http.ts` — Custom JWT sign/verify (HS256)
- `server/src/infra/rate-limiter.ts` — In-memory rate limiter
- `server/src/auth/auth.middleware.ts` — JWT cookie → req.userId
- `server/src/auth/auth.service.ts` — register, login, getUserById
- `server/src/auth/auth.controller.ts` — HTTP handlers for auth routes
- `server/src/auth/auth.router.ts` — Auth route wiring
- `shared/contracts/` — Zod schemas + DTOs shared front/back
- `web/src/core/api-client.ts` — Axios instance + API functions
- `web/src/core/router.tsx` — React Router config
- `web/vite.config.ts` — Vite + Tailwind plugin + API proxy to :3001
- `web/src/auth/auth-store.ts` — Zustand store (session + status)
- `web/src/auth/auth-guard.tsx` — ProtectedRoute + PublicRoute
- `vercel.json` — Vercel deploy config (monorepo pnpm workspace filter)

## Roadmap — V1.1 Backend Migration

La migración es slice-based: feature branches apuntan a `develop`. Cuando V1.1 está completo, `develop` se mergea a `main`.

### P1: Infrastructure ✅
> pnpm monorepo, Prisma schema + Supabase PostgreSQL, Express 5 skeleton, Render deploy config
- [x] pnpm-workspace.yaml con server/web/shared/e2e
- [x] Migrar `src/` → `web/src/`
- [x] Prisma schema: profiles, analyses, settings
- [x] Express app skeleton con screaming architecture (auth/, analysis/, profile/, history/)
- [x] Render health check + Dockerfile
- [x] Vite proxy a :3001

### P2: Auth Backend ✅
> Custom JWT (HS256), email/password + Google OAuth, middleware, migration script
- [x] JWT custom (crypto.createHmac — sin jsonwebtoken)
- [x] POST /api/auth/register (bcrypt + Prisma)
- [x] POST /api/auth/login (bcrypt + JWT → httpOnly cookie)
- [x] GET /api/auth/me (requireAuth → session)
- [x] POST /api/auth/logout (clear cookie)
- [x] Google OAuth (zero-dependency: crypto + fetch, anti-CSRF state)
- [x] requireAuth + optionalAuth middleware
- [x] parseCookies utility (sin cookie-parser)
- [x] Rate limiting (auth: 5/15min)

### P3: AI Proxy ✅
> Server-side Groq API, Zod validation
- [x] POST /api/ai/analyze (receive JD → Groq → validated response)
- [x] Groq SDK server-side (no más VITE_GROQ_API_KEY en bundle)
- [x] Zod validation on response
- [x] Error handling + fallback (local analysis engine server-side)

### P4: History API ✅
> CRUD de analyses con Prisma
- [x] GET /api/analyses (list, scoped by userId)
- [x] GET /api/analyses/:id (detail)
- [x] DELETE /api/analyses/:id
- [x] PATCH /api/analyses/:id (edit displayName/notes)
- [x] Repository pattern preserved (HTTP client in web, localStorage fallback)

### P5: Frontend Refactor
> Swap AuthProvider, API client, remove localStorage
- [ ] New AuthProvider (session via GET /api/auth/me)
- [ ] Zustand store: session + status (authenticated/unauthenticated/unknown)
- [ ] Axios client con withCredentials: true
- [ ] ProtectedRoute + PublicRoute guards
- [ ] Swap repositories: localStorage → HTTP API calls
- [ ] Remove Supabase client SDK dependency
- [ ] Remove VITE_GROQ_API_KEY from env
- [ ] History list → backend-backed pagination

### P6: Design Identity — "The Signal"
> Paleta Indigo + Chartreuse, Clash Display + Satoshi
- [ ] Design tokens: OKLCH colors, shadows, radii, typography scale
- [ ] Global styles + CSS variables
- [ ] Component refresh: buttons, cards, inputs, modals, badges
- [ ] Layout & navigation redesign
- [ ] Landing page redesign
- [ ] Auth pages redesign
- [ ] Analysis/history/settings pages alignment
- [ ] Responsive + dark mode parity
- [ ] DESIGN.md update

### P7: E2E + Security
> Playwright flows, hardening
- [ ] Playwright setup (@echolog/e2e, ephemeral SQLite per run)
- [ ] Auth smoke: login + register + logout
- [ ] Analysis smoke: run analysis, view result
- [ ] History smoke: view history, delete item
- [ ] CSP headers with helmet
- [ ] Rate limiting (auth, analysis)
- [ ] Structured logging (pino)
- [ ] Input sanitization

### P8: Polish + Deploy
> Error boundaries, skeletons, docs
- [ ] Error boundaries + error pages
- [ ] Loading skeletons for all pages
- [ ] Empty states (no history, no analysis yet)
- [ ] Vercel rewrites for SPA + API proxy
- [ ] Render health check + deploy config
- [x] CI/CD: GitHub Actions (lint, type, test on PR + push)
- [x] Vercel deploy config (vercel.json en raíz, pnpm workspace filter)

## Roadmap — V1.2 (tentative)

### V1.2.1: User Profiles
> Información persistente del usuario para personalizar análisis
- [ ] PUT /api/profile — skills, experiencia, rol, resume
- [ ] Profile UI — formulario de datos del candidato
- [ ] Prompt enrichment — Groq usa datos del perfil en outreach messages

### V1.2.2: CV Generator
> Armado automático de CV tailor-made basado en análisis
- [ ] POST /api/cv/generate — JD + perfil → CV (reusa lógica de cv-hub)
- [ ] CV preview + export (PDF/HTML)
- [ ] Templates por seniority/industria
- [ ] V1.1 release PR: develop → main

## Skills del Proyecto

Skills locales en `skills/` que deben priorizarse según la tarea:

- `frontend-design` — Interfaces de alto impacto, diseño visual distintivo
- `react-19` — Convenciones React 19 (React Compiler, Actions, ref como prop)
- `tailwind-4` — Tailwind CSS 4, cn(), tokens, responsive
- `typescript` — Tipado estricto, const types, flat interfaces
- `zod-4` — Validación Zod 4, breaking changes desde v3
- `portfolio-personality` — Principios de diseño para que no parezca hecho por IA: paletas audaces, tipografías con carácter, composiciones intencionales. Guía para aplicar "The Signal" (Indigo + Chartreuse, Clash Display + Satoshi)

## Responsabilidades Clínicas (Orchestrator vs Agents)

- **El Orquestador Principal** coordina la conversación, la creación de ramas y los commits.
- **Los Sub-agentes SDD** se limitan estrictamente a explorar, proponer, especificar, diseñar y desglosar tareas de forma asíncrona.
- La creación de carpetas, archivos y código corresponde a la fase de implementación (`sdd-apply`).
- Los sub-agentes **no deben** crear ramas ni hacer commits por su cuenta. Son ejecutores de fases.
- **Regla de Hierro**: Toda decisión se toma antes de escribir código. No hay implementación sin spec y diseño aprobados.
