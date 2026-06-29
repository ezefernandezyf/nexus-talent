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
- **Design System**: "The Signal" — Indigo / Chartreuse palette, Cabinet Grotesk (display) + Satoshi (body), dark-first, basado en portfolio-personality (anti-convergencia)

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

## Design Tools (V1.2)

```bash
# Anti-slop detector (antes de cada commit de UI)
npx impeccable detect web/src/

# Design review commands (dentro del agente)
/impeccable init        # setup inicial (PRODUCT.md + DESIGN.md)
/impeccable shape       # planificar antes de codear
/impeccable audit       # quality checks técnicos
/impeccable critique    # UX review
/impeccable polish      # final pass antes de merge
/impeccable animate     # review de animaciones
/impeccable bolder      # amplificar diseño aburrido
/impeccable quieter     # bajar intensidad
/impeccable distill     # simplificar
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

### P5: Frontend Refactor ✅
> Swap AuthProvider, API client, remove localStorage
- [x] New AuthProvider (session via GET /api/auth/me)
- [x] Zustand store: session + status (authenticated/unauthenticated/unknown)
- [x] Axios client con withCredentials: true
- [x] ProtectedRoute + PublicRoute guards
- [x] Swap repositories: localStorage → HTTP API calls
- [x] Remove Supabase client SDK dependency
- [x] Remove VITE_GROQ_API_KEY from env
- [x] History list → backend-backed pagination

### P6: Design Identity — "The Signal" + GEO Foundation ✅
> Basado en portfolio-personality (Estilo B: Minimal/Elegant). Dark-first. Paleta Indigo + Chartreuse. Cabinet Grotesk (display) + Satoshi (body). SSR con Vike (fallback: Vercel Edge). GEO Score 7 → 35.
- [x] **SSR con Vike** para landing `/` y privacy `/privacy`. Vike falló (requiere Vite ≥7.1, tenemos 6.4.3). Fallback: build-time prerender con Vite SSR. ✅
- [x] Design tokens: OKLCH colors, shadows, radii, typography scale
- [x] Global styles + CSS variables
- [x] Component refresh: buttons, cards, inputs, modals, badges
- [x] Layout & navigation redesign
- [x] Landing page redesign **con contenido estructurado**: H1, H2 sections, FAQ (5 Q&A), 300+ palabras, answer blocks para AI citability (GEO HIGH #CTB-1)
- [x] Responsive + dark mode parity
- [x] **GEO/SEO Quick Wins** (Week 1-2 del audit):
  - [x] Schema JSON-LD: Organization + SoftwareApplication + WebSite (GEO CRITICAL #SCH-1)
  - [x] Open Graph + Twitter Card meta tags (GEO HIGH #TEC-2)
  - [x] Title tag optimizado (SEO)
  - [x] Keywords target (SEO)
  - [x] Canonical URL tag (GEO HIGH #CTB-2)
  - [x] llms.txt estático en `/public/` (GEO HIGH #TEC-1)
  - [x] robots.txt con AI crawlers explícitos (GEO)
  - [x] `<noscript>` fallback con contenido clave (GEO Quick Win #5)
  - [x] Favicon estable sin hash (GEO LOW #CON-3)
  - [ ] Google Search Console: submit sitemap (SEO) → manual, requiere acceso a GSC

### P7: E2E + Security ✅
> Playwright flows, hardening
- [x] Playwright setup (ephemeral SQLite per run via chained webServer command)
- [x] Auth smoke: login + register + logout (via API)
- [x] Analysis smoke: validate endpoint behavior (502 no key, 400 empty JD)
- [x] History smoke: view history, delete non-existent returns 404
- [x] **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (GEO MEDIUM #TEC-3) — manual middleware, no helmet dependency
- [x] Rate limiting (auth: 100/test, 5/prod; analysis: 10/min)
- [x] Structured logging (pino-http middleware + event logging)
- [x] Input sanitization (Zod validation at API layer)

### P8: Polish + Deploy ✅
> Error boundaries, skeletons, docs, OAuth security
- [x] CI/CD: GitHub Actions (lint, type, test on PR + push)
- [x] Vercel deploy config (vercel.json en raíz, pnpm workspace filter)
- [x] Vercel rewrites for SPA + API proxy (proxy /api/* → Render)
- [x] Render health check + deploy config
- [x] ServerErrorPage + AuthShell redesign
- [x] DESIGN.md + README docs
- [x] **OAuth Code Exchange**: one-time code en vez de JWT en redirect URL (seguridad)
- [ ] Error boundaries + error pages
- [ ] Loading skeletons for all pages
- [ ] Empty states (no history, no analysis yet)
- [ ] **Lighthouse 90+** en mobile (SEO — Core Web Vitals)

---
## V1.1 — Released ✅
> Tag: `v1.1` | Deploy: Vercel + Render + Supabase

### V1.1 Bug Fixes
- [x] maxAge en milisegundos (no segundos) — OAuth state + session cookies
- [x] fix(proxy): Render subdomain en Vercel rewrite (nexus-talent-api)
- [x] fix(build): skip prerender en Vercel para evitar OOM
- [x] fix(analysis): Groq json_object + Zod sin id/createdAt
- [x] fix(auth): cross-domain session cookies (Vercel Edge Function)
- [x] chore: remove em-dashes from entire project

---
## V1.2 — Redesign & UX Excellence

> **Filosofía**: Rehacer el frontend desde cero con un design system sólido, usando Impeccable (anti-slop + 23 comandos) y taste-skill (dirección visual + anti-repetición).

### 🎨 P9: Design System Foundation
> Setup de herramientas + DESIGN.md + tokens globales. **Sin componentes nuevos todavía — solo base.**

**Skills activas**: impeccable, taste-skill/design-taste-frontend, taste-skill/minimalist-ui

- [ ] `/impeccable init` — generar PRODUCT.md + DESIGN.md con la identidad del proyecto
- [ ] Definir paleta de colores final (OKLCH, dark-first, con taste-skill guidance)
- [ ] Definir escala tipográfica (fuentes display + body, sin Inter/Arial)
- [ ] Definir spacing scale + radii + shadows (con impeccable anti-pattern checks)
- [ ] CSS reset + custom properties globales (`:root` variables)
- [ ] Audit de componentes existentes con taste-skill/redesign-existing-projects
- [ ] `npx impeccable detect web/src/` — limpiar anti-patrones detectados

### 🧱 P10: Core Components Redesign
> **Desde cero.** Cada componente usa taste-skill para dirección visual e impeccable para anti-slop.

**Skills activas**: taste-skill/design-taste-frontend, taste-skill/high-end-visual-design, impeccable

- [ ] Button (variants: primary, secondary, ghost, danger, sizes)
- [ ] Input + Textarea (con estados: focus, error, disabled, with icon)
- [ ] Card + Card variants (flat, elevated, interactive)
- [ ] Modal + Drawer (con backdrop + focus trap + animation)
- [ ] Badge + Tag + Status indicators
- [ ] Toast / Notification + toast provider
- [ ] Dropdown / Select / Menu
- [ ] Tabs + Toggle Group
- [ ] Tooltip + Popover
- [ ] Skeleton loader primitives (base para P11)
- [ ] `/impeccable audit` cada batch de componentes
- [ ] Tests unitarios (Vitest) + snapshots para cada componente

### 📄 P11: Page Shells + UX States
> Layouts, skeletons, empty states, error boundaries. **Sin estos, el app se siente roto.**

- [ ] ErrorBoundary component (con fallback UI + retry)
- [ ] Loading skeletons: AnalysisPage, HistoryPage, HistoryDetailPage, SettingsPage
- [ ] Empty states: "No analysis yet" (con CTA), "No history found", "No results"
- [ ] AppLayout redesign (sidebar/navbar/topbar con nueva identidad)
- [ ] AuthShell redesign (sign-in, sign-up, OAuth callback pages)
- [ ] Landing page redesign (manteniendo SEO/GEO content, nuevo diseño visual)
- [ ] MobileDrawer + responsive navigation
- [ ] `/impeccable critique` en cada página terminada

### ✨ P12: Polish + Animation
> Micro-interacciones, transiciones, feedback visual.

**Skills activas**: taste-skill/high-end-visual-design, impeccable (animate, polish, delight)

- [ ] Page transitions (route changes con framer-motion)
- [ ] Hover + focus states en todos los componentes interactivos
- [ ] Loading → Success → Error state transitions
- [ ] Skeleton → Content reveal animation
- [ ] Toast enter/exit animations
- [ ] Modal/Drawer open/close con spring physics
- [ ] Scroll-triggered reveals (landing page)
- [ ] `/impeccable animate` review
- [ ] `/impeccable polish` final pass

### 🚀 P13: Performance + Lighthouse
> Core Web Vitals, bundle size, SEO técnico.

- [ ] Lighthouse 90+ mobile (Performance, Accessibility, Best Practices, SEO)
- [ ] Bundle analysis (`vite build --debug`) — split chunks grandes
- [ ] Dynamic imports + lazy loading de páginas y componentes pesados
- [ ] Image optimization (WebP/AVIF, lazy loading, responsive sizes)
- [ ] Font loading strategy (font-display: swap, subset, preload)
- [ ] CSS purge / unused style removal
- [ ] `npx impeccable detect` — limpiar issues restantes
- [ ] Google Search Console: submit sitemap (manual)

---
## V1.2.1 — User Profiles + Brand Authority

### 👤 P14: User Profiles
- [ ] PUT /api/profile — skills, experiencia, rol, resume, linkedin, github
- [ ] Profile UI — formulario con validación Zod + React Hook Form
- [ ] Prompt enrichment — Groq usa datos del perfil en outreach messages
- [ ] Profile picture / avatar upload (opcional, Cloudinary o similar)

### ⚙️ P15: Settings Backend
- [ ] CRUD endpoints: GET/PUT /api/settings
- [ ] Settings UI — theme, notifications, account preferences
- [ ] Rate limit settings: configuración por usuario

### 🌐 P16: GEO Brand Building (async, paralelo al dev)
> Semana 3-4 del GEO audit. La mayoría es manual, no código.

- [ ] sameAs links en Organization schema (GEO)
- [ ] Crear/claim LinkedIn company page (GEO CRITICAL)
- [ ] Product Hunt launch prep (GEO CRITICAL)
- [ ] Crunchbase company profile
- [ ] Poblar GitHub org con README + docs
- [ ] Registrar en G2 y Capterra
- [ ] Blog content: 2-3 artículos SSR-rendered
- [ ] YouTube demo video (2-3 min)
- [ ] Re-run GEO audit — target: 50-60/100

---
## V1.2.2 — CV Generator

### 📝 P17: CV Generator
- [ ] POST /api/cv/generate — JD + perfil → CV (Groq + template system)
- [ ] CV preview UI (live rendering, no export todavía)
- [ ] Templates: tech, business, creative (por seniority/industria)
- [ ] PDF export (puppeteer o similar en server)
- [ ] HTML export (download .html standalone)
- [ ] CV history — guardar y reutilizar CVs generados

---
## V1.2 Skills Instaladas

Skills locales en `.opencode/skills/` y `.agents/skills/` que deben priorizarse:

### Diseño
- `impeccable` (`.opencode/skills/impeccable/`) — 23 comandos de diseño, detector anti-slop, `/impeccable audit/polish/critique/animate/bolder/quieter`
- `design-taste-frontend` (`.agents/skills/design-taste-frontend/`) — taste-skill v2 con diales VARIANCE/MOTION/DENSITY
- `high-end-visual-design` (`.agents/skills/high-end-visual-design/`) — UI premium, contraste suave, spring motion
- `minimalist-ui` (`.agents/skills/minimalist-ui/`) — Estilo Notion/Linear, paleta contenida
- `redesign-existing-projects` (`.agents/skills/redesign-existing-projects/`) — Auditoría de UI existente → fix
- `portfolio-personality` (`.opencode/skills/portfolio-personality/`) — Anti-convergencia, identidad visual distintiva

### Desarrollo
- `react-19` — React 19 (Compiler, Actions, ref como prop)
- `tailwind-4` — Tailwind CSS 4, cn(), tokens, responsive
- `typescript` — Tipado estricto, const types, flat interfaces
- `zod-4` — Validación Zod 4
- `go-testing` — Patrones de testing Go (si aplica)

## Convenciones V1.2

- **Design-first**: Siempre `/impeccable init`/`shape` antes de escribir componentes
- **Anti-slop**: Correr `npx impeccable detect` antes de cada commit de UI
- **No em-dashes**: Ya limpiados. No reintroducir.
- **Componentes nuevos en `web/src/shared/components/`**: Reemplazan los viejos de V1.1
- **Feature flag**: Componentes viejos se mantienen hasta que los nuevos estén completos
- **Testing**: Snapshot tests para componentes visuales, unit tests para lógica

## Responsabilidades Clínicas (Orchestrator vs Agents)

- **El Orquestador Principal** coordina la conversación, la creación de ramas y los commits.
- **Los Sub-agentes SDD** se limitan estrictamente a explorar, proponer, especificar, diseñar y desglosar tareas de forma asíncrona.
- La creación de carpetas, archivos y código corresponde a la fase de implementación (`sdd-apply`).
- Los sub-agentes **no deben** crear ramas ni hacer commits por su cuenta. Son ejecutores de fases.
- **Regla de Hierro**: Toda decisión se toma antes de escribir código. No hay implementación sin spec y diseño aprobados.
