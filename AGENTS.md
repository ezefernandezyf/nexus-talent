# Nexus Talent — Agent Context

> AI-assisted job application copilot. Transform a job description into a structured summary, skills matrix, and personalized outreach messages.

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
- **Design System**: "Editorial Precision" — Warm Monochrome + Terracotta (#C46B4F), light-first

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
1. **Develop branch**: `develop` is the integration branch. ALL feature branches merge here first.
2. **Main branch**: `main` is the stable release. Only merge from `develop` when completing a milestone (multiple phases done).
3. **Feature branches**: EVERY task starts on a new branch from `develop`
4. **Branch naming**: `feat/short-name`, `fix/short-name`, `chore/short-name`
5. **Atomic commits**: one logical change layer per commit, conventional format
6. **PR to develop first**: push branch, create PR to `develop`, squash-merge
7. **Main on milestone**: `develop` → PR to `main` when a stage is complete
8. **Clean working tree**: no untracked files, no WIP before PR
9. **Lint before push**: `pnpm run lint && pnpm run format` must pass
10. **Tests before merge**: `pnpm test` (server + web) must pass
11. **HARD GATE**: `pnpm run dev` + manual smoke test before merging to main

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
- `web/src/index.css` — design tokens (Editorial Precision), @utility typography, Tailwind 4 theme
- `web/src/shared/components/` — all shared components (Button, Card, Badge, Input, Label, Textarea, Modal, Drawer, Dropdown, Select, Tabs, ToggleGroup, Toast, Tooltip, Popover, Eyebrow, Reveal)
- `web/src/shared/layouts/AppLayout.tsx` — app shell with sticky header, horizontal nav
- `web/src/shared/components/Footer/Footer.tsx` — marketing footer
- `web/src/features/landing/pages/LandingPage.tsx` — landing page (editorial design, Spanish)
- `web/src/features/auth/components/AuthShell.tsx` — auth pages shell
- `web/src/features/analysis/components/AnalysisResultView.tsx` — 5-section numbered analysis
- `web/src/features/history/components/HistoryList.tsx` — history with pagination
- `web/src/features/settings/SettingsFeature.tsx` — 3-card settings (Account/Appearance/Data)
- `server/prisma/schema.prisma` — data model (Profile, Analysis, Settings, UserSettings)
- `server/src/infra/app.ts` — Express app + route wiring
- `server/src/infra/rate-limiter.ts` — IP + per-user tier rate limiter
- `server/src/settings/settings.router.ts` — GET/PUT /api/settings
- `server/src/settings/settings.service.ts` — getOrCreate, upsert, getRateLimitTier
- `server/src/auth/oauth.service.ts` — Google OAuth + linkIdentity()
- `shared/src/schemas.ts` — Zod schemas: auth, analysis, profile, userSettings

## Completed Phases (V1.2)

### 🟢 P9-P10: Design System Foundation + Core Components
Design tokens, 12 component families (Button, Card, Input, Modal, Badge, Toast, Dropdown, Tabs, Tooltip, Skeleton). 345 tests.

### 🟢 P11: Page Shells + UX States
ErrorBoundary, loading skeletons, empty states, z-index tokens, AppLayout migration.

### 🟢 P11ter: Editorial Precision Migration
Migrated visual design from Lovable reference to Nexus Talent architecture. Warm monochrome + terracotta, Switzer + Geist fonts.

### 🟢 P11quater: Pixel-Perfect Alignment
SDD cycle: 4 stacked PRs, @utility typography, sticky header, 5-section analysis, 3-card settings, 341 tests.

### 🟢 P11quin: UX Quality & Copy Alignment
Merged to main. Output copy rewrite, logout modal, OAuth hidden, WCAG fixes, 5 runtime bugs.

### 🟢 P12: Polish + Animation
Spring transitions, enter/exit animations, reducedMotion hook, page transitions. 4 commits.

### 🟢 P13: Performance + Lighthouse (core)
Lazy loading, font-display swap, manualChunks, favicon SVG, cache headers.

### 🔶 P13bis: Performance Polish (DEFERRED)
> Post-V1.2.1. No bloquea features.

- [ ] E2E port conflict, Lighthouse 90+ mobile, image optimization, CSS purge, impeccable detect, sitemap

---
## V1.2.1 — User Profiles + Settings Backend ✅

### 🟢 P14: User Profiles
DB: 7 Profile fields. Shared: profileUpdateSchema. API: PUT /api/profile. UI: ProfileEditorCard. AI: prompt enrichment. 398 tests. 2 stacked PRs.

### 🟢 P15: Settings Backend
> **431 tests — 4 stacked PRs — merged to develop**

**PR #1** — Foundation: `UserSettings` Prisma model + migration, Zod schemas, `GET/PUT /api/settings`, settings service (getOrCreate, upsert, getRateLimitTier)
**PR #2** — OAuth Linking: `?link=true` flow, `linkIdentity()`, callback detection, `DELETE /api/auth/oauth/google` unlink
**PR #3** — Rate Limiter per-user tiers: TIER_LIMITS (60/30/10 per minute), per-user key resolution via `getTier`, backward compatible
**PR #4** — Frontend: `useAppSettings` React Query hook, ThemeProvider API sync, `ACCOUNT_LINKING_AVAILABLE = true`

---
## Roadmap

### 🔶 P13bis: Performance Polish (DEFERRED)
> E2E, Lighthouse, images, CSS, impeccable, sitemap. Retomar post-V1.2.1.

### 🌐 P16: GEO Brand Building (async, manual)
- [ ] sameAs schema, LinkedIn company page (CRITICAL), Product Hunt, Crunchbase
- [ ] GitHub org docs, G2/Capterra, blog (2-3 SSR articles), YouTube demo
- [ ] Re-run GEO audit — target 50-60/100

### 📝 P17: CV Generator
- [ ] POST /api/cv/generate — Groq + templates
- [ ] CV preview UI + PDF export (puppeteer) + HTML export
- [ ] CV history & templates (tech/business/creative)

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

---
## Pixel-Perfect Reference Alignment

> Guía para verificar que cada página implementada coincide visualmente con la referencia de Lovable (`editorial-lens`).

### Las 4 Capas de Verificación (en orden)

| Capa | Qué verifica | Cómo verificarlo |
|------|-------------|------------------|
| **1. Tokens** | Valores de color, tipografía, spacing | DevTools computed styles contra `index.css` variables |
| **2. Primitives** | Card, Button, Input, Badge, Label | Side-by-side con referencia, mismo padding/radius/font |
| **3. Layout** | Espaciado entre secciones, alineación, proporciones | Screenshot overlay o DevTools layout inspector |
| **4. Pages** | Composición completa de cada página | Side-by-side navegando ambas apps |

### Acceptance Criteria

Pixel-perfect significa:

- [ ] **Color values match**: cada token CSS resuelve al mismo valor hex/OKLCH que la referencia
- [ ] **Spacing matches**: padding, margin, gap entre elementos es idéntico
- [ ] **Typography matches**: font-family, weight, size (clamp), letter-spacing, line-height
- [ ] **Border-radius / shadow match**: mismos valores de radio y sombra
- [ ] **Layout proportions match**: mismos anchos relativos, alturas, distribuciones de grid
- [ ] **Interactive states match**: hover, focus, active tienen los mismos efectos
- [ ] **Section order matches**: mismos componentes en el mismo orden de arriba a abajo
- [ ] **Component composition matches**: cada componente usa los mismos sub-componentes internos en el mismo orden

### Lo Que Pixel-Perfect NO Significa

| Exclusión | Razón |
|-----------|-------|
| **File structure** | Mantenemos folder-per-component de Nexus Talent |
| **API / props** | Mantenemos nuestra API de componentes (Button variant, Card padding, etc.) |
| **Content / copy** | El contenido sigue siendo español. Las etiquetas y copy son nuestros. |
| **Business logic** | Hooks, stores, queries, Zod schemas — intactos |

### Verification Tools

1. **Manual side-by-side**: abrir la app y la referencia (editorial-lens) en ventanas lado a lado
2. **DevTools computed-style comparison**: seleccionar el mismo elemento en ambas y comparar valores computados
3. **Screenshot overlay**: tomar screenshot de la referencia, superponer con la implementación al 50% de opacidad
4. **Token audit script**: `grep -r 'text-on-surface\|bg-surface-container\|surface-elevated' web/src/` — debe devolver 0 matches
5. **Anti-pattern detection**: `npx impeccable detect web/src/` — 0 nuevos anti-patrones por PR
