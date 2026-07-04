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
- **Design System**: "Apex" — Deep Teal + Warm Amber OKLCH palette, Switzer (display) + Geist (body), dark-first with light parity, anti-convergence via portfolio-personality

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
1. **Develop branch**: `develop` is the integration branch for V1.2. All feature branches merge here.
2. **Feature branches**: EVERY task starts on a new branch from `develop`
3. **Branch naming**: `feat/short-name`, `fix/short-name`, `chore/short-name`
4. **Atomic commits**: one logical change layer per commit, conventional format
5. **Push + PR + Merge**: push branch, create PR to `develop`, squash-merge
6. **V1.2 Release**: `develop` → PR to `main` when all phases are done
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

> V1.1 released. Tag: `v1.1` | Deploy: Vercel + Render + Supabase

---
## V1.2 — Redesign & UX Excellence

> **Filosofía**: Rehacer el frontend desde cero con un design system sólido, usando Impeccable (anti-slop + 23 comandos) y taste-skill (dirección visual + anti-repetición).

### 🎨 ✅ P9: Design System Foundation (DONE — PRs #55 + #57)
> Setup de herramientas + DESIGN.md + tokens globales. **Sin componentes nuevos todavía — solo base.**

**Skills activas**: impeccable, taste-skill/design-taste-frontend, taste-skill/minimalist-ui

- [x] `/impeccable init` — generar PRODUCT.md + DESIGN.md con la identidad del proyecto
- [x] Definir paleta de colores final (OKLCH, dark-first, con taste-skill guidance) → "Apex": Deep Teal + Warm Amber
- [x] Definir escala tipográfica (fuentes display + body, sin Inter/Arial) → Switzer + Geist
- [x] Definir spacing scale + radii + shadows (con impeccable anti-pattern checks)
- [x] CSS reset + custom properties globales (`:root` variables)
- [x] Audit de componentes existentes con taste-skill/redesign-existing-projects
- [x] `npx impeccable detect web/src/` — limpiar anti-patrones detectados

### 🧱 ✅ P10: Core Components Redesign (DONE — PRs #59 + #62 + #58)
> **Desde cero.** 12 familias de componentes con Apex design system. 345 tests, build limpio.

**Skills activas**: taste-skill/design-taste-frontend, taste-skill/high-end-visual-design, impeccable

- [x] Fixear errores de lint preexistentes en `server/src/history/history.service.ts`
- [x] Button (variants: primary, secondary, ghost, danger, sizes)
- [x] Input + Textarea (con estados: focus, error, disabled, with icon)
- [x] Card + Card variants (flat, elevated, interactive)
- [x] Modal + Drawer (con backdrop + focus trap + animation)
- [x] Badge + Tag + Status indicators
- [x] Toast / Notification + toast provider (Zustand store)
- [x] Dropdown / Select / Menu
- [x] Tabs + Toggle Group
- [x] Tooltip + Popover (custom Portal for FloatingPortal bug)
- [x] Skeleton loader primitives (base para P11)
- [x] `/impeccable audit` cada batch de componentes
- [x] Tests unitarios (Vitest) + snapshots para cada componente (345 total)

> **Nota P10**: El bloque `@layer components` fue eliminado de `index.css` (-204 líneas). Los layouts y páginas existentes aún referencian clases viejas como `primary-button`, `surface-panel`, etc. — esto se arregla en P11.

### 📄 ✅ P11: Page Shells + UX States (DONE — PRs #63-#68)
> Infraestructura de UX — ErrorBoundary, skeletons, empty states, z-index tokens. Rediseño visual real de páginas diferido a P11bis.

- [x] ErrorBoundary component (con fallback UI + retry, per-route errorElement)
- [x] Loading skeletons: AnalysisPage, HistoryPage, HistoryDetailPage, SettingsPage (4 page-specific)
- [x] Empty states: "No analysis yet" (con CTA), "No history found", "No results"
- [x] AppLayout migrated to Apex components + z-index tokens
- [x] AuthShell redesigned (sign-in, sign-up, OAuth callback with Apex identity)
- [x] Landing page migrated to Apex components
- [x] MobileDrawer z-index integration
- [x] Footer consolidated (3→1 canonical with variant prop)
- [x] 50+ dangling CSS class references replaced
- [x] 10 z-index tokens enforced across all components
- [x] 352 tests, typecheck clean, lint clean

> **Nota**: P11 fue migración de infraestructura. P11bis fue un intento de rediseño visual Apex que no gustó. P11ter reemplaza todo con el diseño que sí gustó.

### 🎨 ✅ P11bis: Real Page Redesign — Apex (DESCARTADO)
> Rediseño visual con Apex (Deep Teal + Warm Amber). No gustó el resultado. Reemplazado por P11ter.

### 🎨 P11ter: Editorial Precision — Lovable Design Migration (en progreso)
> Tomar el diseño generado en Lovable (editorial-lens) como REFERENCIA VISUAL y migrarlo a nuestra arquitectura. NO copy-paste — adaptar con nuestras convenciones.

**Referencia**: `github.com/ezefernandezyf/editorial-lens`
**Skills activas**: taste-skill/design-taste-frontend, high-end-visual-design, minimalist-ui

#### Sistema de Diseño "Editorial Precision"
- **Paleta**: Warm off-white (#FBFBFA) + espresso text (#1A1714) + terracotta accent (#C46B4F)
- **Tipografía**: Switzer (display) + Geist (body) + JetBrains Mono (code)
- **Light-first** con dark mode derivado via `prefers-color-scheme`
- **Sombras**: ultra-sutiles, cards flotan apenas (0 1px 3px rgba(0,0,0,0.04))
- **Bordes**: 1px #EAEAEA, radius 6-12px
- **Sin gradientes, sin glows, sin glassmorphism**
- **Textura**: warm grain overlay al 2% (paper-like)

#### Plan de Migración
- [ ] 1. Migrar tokens de diseño a `web/src/index.css` (@theme block)
- [ ] 2. Actualizar componentes Apex al look Editorial (Button/Card/Badge/Input — cambiar estilos, mantener API)
- [ ] 3. Crear primitivas editoriales: `<Reveal>`, `<Eyebrow>` (scroll reveal + eyebrow label)
- [ ] 4. Rediseñar Landing page con layout editorial (hero asimétrico, bento grid, features, FAQ, CTA)
- [ ] 5. Rediseñar AuthShell con split layout (brand statement izq, form der)
- [ ] 6. Rediseñar AppLayout con nav editorial (sticky top, accent active state)
- [ ] 7. Rediseñar Analysis page con cards editoriales
- [ ] 8. Rediseñar History list + detail con el nuevo look
- [ ] 9. Rediseñar Settings page
- [ ] 10. Actualizar 404 + 500 + Privacy pages
- [ ] 11. `npx impeccable detect` — verificar 0 anti-patrones
- [ ] 12. Tests: actualizar snapshots + unit tests

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

- [ ] Fixear E2E port conflict (detectado en verify de P9)
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
