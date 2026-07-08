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
- `server/prisma/schema.prisma` — data model
- `server/src/infra/app.ts` — Express app + route wiring
- `shared/contracts/` — Zod schemas + DTOs

## Completed Phases (V1.2)

### P9-P10: Design System Foundation + Core Components
Design tokens, 12 component families (Button, Card, Input, Modal, Badge, Toast, Dropdown, Tabs, Tooltip, Skeleton), 345 tests.

### P11: Page Shells + UX States
ErrorBoundary, loading skeletons, empty states, z-index tokens, AppLayout migration.

### P11ter: Editorial Precision Migration
Migrated visual design from Lovable reference (editorial-lens). Warm monochrome palette + terracotta accent, Switzer + Geist fonts, light-first with dark mode.

### P11quater: Pixel-Perfect Alignment
Full SDD cycle: 4 stacked PRs achieving pixel-perfect alignment with editorial-lens reference. @utility typography, sticky header layout, 5-section analysis cards, 3-card settings, Spanish landing page, 341 tests.

## ⚠️ P11quin: UX Quality & Copy Alignment (BUILD PASSED — 5 runtime bugs pendientes)

> Prompt y componentes aplicados pero con bugs en runtime. Los 5 fixes son el foco ACTUAL.

- [x] Output copy prompt reescrito en server
- [x] Logout confirmation modal agregado
- [x] OAuth section hidden
- [x] Landing buttons WCAG fix
- [x] AGENTS.md cleanup
- [ ] **Bug 1**: AI output sigue sonando a reclutador — `applicantSummary` no está en `required` del Groq schema
- [ ] **Bug 2**: Landing "Empieza gratis" texto invisible — regla global `a { color: var(--color-brand) }` pisa `text-white`
- [ ] **Bug 3**: Navbar logout no funciona — Modal muere al cerrar dropdown (event bubbling)
- [ ] **Bug 4**: Settings nombre/email update → 404 — router `/profile` tiene solo un endpoint de test
- [ ] **Bug 5**: Settings "Exportar datos" sin handler — botón sin onClick
- [ ] **HARD GATE**: verificar con `pnpm run dev` ANTES de mergear a main

---
## Future Phases

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
- [ ] OAuth identity linking (deferred from P11quin)
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
