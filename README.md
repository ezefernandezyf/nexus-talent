# Nexus Talent

> Asistente de reclutamiento de precision asistido por IA. Transforma una descripcion de puesto en analisis estructurado, matriz de habilidades y borradores de outreach. Ademas, genera CVs personalizados con IA.

---

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | **React 19**, TypeScript strict, Vite 6, Tailwind CSS 4, React Router 7 |
| Backend | **Express 5**, TypeScript, Prisma 7 (Supabase PostgreSQL), Zod 4 |
| Server State | **TanStack Query** (React Query v5) |
| UI State | **Zustand** (auth status, UI toggles) |
| Auth | Custom JWT (HS256) en cookies httpOnly, bcrypt, Google OAuth |
| AI | **Groq API** server-side (nunca expuesta al cliente) |
| Testing | **Vitest** (212 tests), **Playwright** (E2E) |
| Forms | React Hook Form + Zod resolver |
| Package Manager | **pnpm** 11 (workspace monorepo) |

---

## Architecture

```
nexus-talent/
├── server/              ← Express 5 backend (screaming architecture)
│   ├── src/
│   │   ├── auth/        JWT, register, login, OAuth, middleware
│   │   ├── analysis/    Groq AI proxy, validation
│   │   ├── cv/          WorkExperience + Education CRUD, generateCV() con Groq
│   │   ├── profile/     User profile endpoints
│   │   ├── history/     CRUD de analyses
│   │   ├── settings/    UserSettings, rate limit tiers
│   │   └── infra/       App shell, Prisma, rate limiter, logger
│   ├── prisma/          Schema, migrations
│   └── Dockerfile
├── web/                 ← React 19 frontend
│   └── src/
│       ├── features/
│       │   ├── analysis/   Analisis de puestos
│       │   ├── auth/       AuthProvider, guards, store, API hooks
│       │   ├── cv/         CV Generator con preview y export (.md/.html/.pdf)
│       │   ├── history/    Historial de analyses
│       │   ├── landing/    Landing page + marketing
│       │   └── settings/   Profile editor + preferences
│       ├── core/           Router, API client, ErrorBoundary, theme
│       └── shared/         Componentes reusables (Button, Card, Input, Modal, etc.)
├── shared/              ← Zod schemas + types compartidos front/back
├── e2e/                 ← Playwright end-to-end tests
└── openspec/            ← Artefactos SDD (especificaciones, diseno, tareas)
```

### Flujo de datos obligatorio

```
Input Usuario -> Validacion Zod (shared) -> Request API -> Server validation ->
Groq API -> Response IA -> Zod validation -> Response al frontend -> Render
```

---

## Design System "Editorial Precision"

- **Paleta**: Warm Monochrome + Terracotta (#C46B4F) en OKLCH
- **Tipografia**: Switzer (body) + Geist (mono), auto-hosted en `web/src/assets/`
- **Estrategia**: Light-first con variante `data-theme="dark"`
- **Principios**: Editorial limpi, contraste suave, tipografico, anti-generico

---

## Comandos

```bash
# Instalar dependencias (todo el workspace)
pnpm install

# Generar cliente Prisma
pnpm run prisma:generate

# Correr migraciones
pnpm run prisma:migrate

# Desarrollo -- dos terminales
pnpm run dev:server   # Backend en http://localhost:3001
pnpm run dev:web      # Frontend en http://localhost:5173

# Tests
pnpm run test         # Unitarios (server + web): 212 tests
pnpm run test:e2e     # E2E (Playwright)

# Lint + formato
pnpm run lint
pnpm run format

# Build
pnpm run build:server
pnpm run build:web
```

---

## Testing

### Unit Tests (Vitest) -- 212 tests

```bash
pnpm test                    # Server + web
pnpm --filter @nexus-talent/server test   # 123 tests
pnpm --filter @nexus-talent/web test      # 89 tests
```

| Modulo | Tests |
|--------|-------|
| Server: Auth | 27 |
| Server: Analysis | 4 |
| Server: CV (CRUD + generate) | 34 |
| Server: History | 28 |
| Server: Profile | 13 |
| Server: Rate Limiter | 18 |
| Server: Settings | 5 |
| Web: CV (hooks, pages, components, export) | 63 |
| Web: Core + Shared | 26 |

### End-to-End (Playwright)

```bash
pnpm run test:e2e
```

Cubre flujos de auth, analysis, history y CV generator con base de datos SQLite efimera por ejecucion.

---

## Deploy

| Componente | Plataforma | Config |
|-----------|-----------|--------|
| Frontend | **Vercel** | `vercel.json` -- pnpm workspace filter + API proxy a Render |
| Backend | **Render** | `render.yaml` (Blueprint) + Dockerfile |

### Vercel

- Build: `pnpm --filter @nexus-talent/web build`
- Output: `web/dist`
- SPA catch-all + prerender para `/` y `/privacy`
- API proxy: `/api/*` -> `https://nexus-talent.onrender.com/api/*`

### Render

- Web service con Dockerfile en `server/`
- Health check: `GET /health`

---

## Variables de Entorno

| Variable | Desarrollo | Produccion | Requerida |
|----------|-----------|-----------|-----------|
| `DATABASE_URL` | `file:./dev.db` (SQLite local) | PostgreSQL connection string de Supabase | Si |
| `JWT_SECRET` | `dev-secret-...` | Secreto robusto de 256+ bits | Si |
| `GROQ_API_KEY` | (opcional en local) | API key de Groq | Si (prod) |
| `CORS_ORIGIN` | `http://localhost:5173` | URL de Vercel | Si |
| `VITE_API_URL` | `http://localhost:3001` | URL de Render | Si |
| `VITE_APP_URL` | `http://localhost:5173` | URL del frontend en Vercel | Si |
| `PORT` | `3001` | Asignado por Render | - |

---

## SDD (Spec-Driven Development)

Este repositorio sigue SDD con artefactos en `openspec/` y memoria persistente en Engram.

Ciclo completo:
1. `sdd-init` -> 2. `sdd-explore` -> 3. `sdd-propose` -> 4. `sdd-spec`
-> 5. `sdd-design` -> 6. `sdd-tasks` -> 7. `sdd-apply` -> 8. `sdd-verify` -> 9. `sdd-archive`

Ver `AGENTS.md` para reglas detalladas de trabajo y contexto del proyecto.

---

## Convenciones

- **Commits**: Conventional Commits. Titulo en ingles, descripcion en espanol.
- **React 19**: Sin useMemo/useCallback (React Compiler lo maneja). Named exports.
- **TypeScript**: Strict mode. Sin `any`. Prefer `interface` sobre `type` para props.
- **Zod**: Schemas compartidos en `shared/` son la unica fuente de verdad.
- **No-Line Rule**: Separar por contraste de fondo o ghost borders, no por lineas solidas de 1px.
- **UX States**: Todo proceso asincrono debe tener estados Loading, Success, Error y Empty.
- **0 sobreingenieria**: Clara sobre ingeniosa. Si no hace falta, no esta.

---

## Estado del Proyecto (V1.3)

- P1: Infraestructura (monorepo, Prisma, Express skeleton, Render deploy)
- P2: Auth Backend (JWT custom, email/password, Google OAuth)
- P3: AI Proxy (Groq server-side, Zod validation)
- P4: History API (CRUD de analyses)
- P5: Frontend Refactor (AuthProvider, TanStack Query, Zustand)
- P6: Design Identity + GEO Foundation
- P7: E2E + Security (Playwright, CSP, rate limiting, logging)
- P8-12: Polish, Animation, Performance, Design System
- P14: User Profiles (7 campos, API, ProfileEditorCard, AI enrichment)
- P15: Settings Backend (UserSettings, OAuth linking, rate limit tiers, theme sync)
- P17: CV Generator (WorkExperience + Education CRUD, generateCV con Groq, preview, export)

### Pendiente

- P13bis: Performance Polish (Lighthouse, images, CSS, E2E port)
- P16: GEO Brand Building (async, manual)
