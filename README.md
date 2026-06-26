# Nexus Talent

> Asistente de reclutamiento de precisión asistido por IA. Transformá una descripción de puesto en tres salidas accionables: resumen estructurado, matriz de habilidades y borrador de outreach editable.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | **React 19**, TypeScript strict, Vite 6, Tailwind CSS 4, React Router 7 |
| Backend | **Express 5**, TypeScript, Prisma 7 (Supabase PostgreSQL), Zod 4 |
| Server State | **TanStack Query** (React Query v5) |
| UI State | **Zustand** (auth status, UI toggles) |
| Auth | Custom JWT (HS256) en cookies httpOnly, bcrypt, Google OAuth |
| AI | **Groq API** server-side (nunca expuesta al cliente) |
| Testing | **Vitest** (unit), **Playwright** (E2E) |
| Forms | React Hook Form + Zod resolver |
| Package Manager | **pnpm** 11 (workspace monorepo) |

---

## Architecture

```
nexus-talent/
├── server/          ← Express 5 backend (screaming architecture)
│   ├── src/
│   │   ├── auth/    ── JWT, register, login, OAuth, middleware
│   │   ├── analysis/ ── Groq AI proxy, validation
│   │   ├── profile/  ── User profile endpoints
│   │   ├── history/  ── CRUD de analyses
│   │   └── infra/    ── App shell, Prisma, rate limiter, logger
│   ├── prisma/       ── Schema, migrations, seeds
│   └── Dockerfile
├── web/             ← React 19 frontend
│   └── src/
│       ├── auth/       ── AuthProvider, guards, store, API hooks
│       ├── features/   ── Feature domains (analysis, history, settings, landing)
│       ├── core/       ── Router, API client, ErrorBoundary, utilities
│       └── shared/     ── Reusable components (Button, Card, Input, EmptyState, LoadingSkeleton)
├── shared/          ← Zod schemas + types compartidos front/back
│   └── contracts/      ── Single source of truth para validación
├── e2e/             ← Playwright end-to-end tests
└── openspec/        ← Artefactos SDD (especificaciones, diseño, tareas)
```

### Flujo de datos obligatorio

```
Input Usuario → Validación Zod (shared) → Request API → Server validation →
Groq API → Response IA → Zod validation → Response al frontend → Render
```

---

## Design System — "The Signal"

- **Paleta**: Indigo + Chartreuse en OKLCH (ver `DESIGN.md`)
- **Tipografía**: Cabinet Grotesk (display) + Satoshi (body), auto-hosted desde Fontshare
- **Estrategia**: Dark-first, con variante `data-theme="light"`
- **Principios**: Anti-convergencia basado en portfolio-personality (estilo Minimal/Elegant)

---

## Comandos

```bash
# Instalar dependencias (todo el workspace)
pnpm install

# Generar cliente Prisma
pnpm run prisma:generate

# Correr migraciones
pnpm run prisma:migrate

# Desarrollo — dos terminales
pnpm run dev:server   # Backend en http://localhost:3001
pnpm run dev:web      # Frontend en http://localhost:5173

# Tests unitarios (server + web)
pnpm run test

# Tests E2E (Playwright)
pnpm run test:e2e

# Lint + formato
pnpm run lint
pnpm run format

# Build
pnpm run build:server
pnpm run build:web
```

---

## Deploy

| Componente | Plataforma | Config |
|---|---|---|
| Frontend | **Vercel** | `vercel.json` — pnpm workspace filter + API proxy a Render |
| Backend | **Render** | `render.yaml` (Blueprint) + Dockerfile |

### Vercel

- Build: `pnpm --filter @nexus-talent/web build`
- Output: `web/dist`
- SPA catch-all + prerender para `/` y `/privacy`
- API proxy: `/api/*` → `https://nexus-talent.onrender.com/api/*`

### Render

- Web service con Dockerfile en `server/`
- Health check: `GET /health`
- Variables requeridas: ver tabla abajo

---

## Variables de Entorno

| Variable | Desarrollo | Producción | Requerida |
|---|---|---|---|
| `DATABASE_URL` | `file:./dev.db` (SQLite local) | PostgreSQL connection string de Supabase | ✓ |
| `JWT_SECRET` | `dev-secret-...` | Secreto robusto de 256+ bits | ✓ |
| `GROQ_API_KEY` | (opcional en local) | API key de Groq | ✓ (prod) |
| `CORS_ORIGIN` | `http://localhost:5173` | URL de Vercel | ✓ |
| `VITE_API_URL` | `http://localhost:3001` | URL de Render | ✓ |
| `VITE_APP_URL` | `http://localhost:5173` | URL del frontend en Vercel | ✓ |
| `PORT` | `3001` | Asignado por Render | — |

---

## Testing

### Unit Tests (Vitest)

```bash
pnpm test                    # Server + web
pnpm --filter @nexus-talent/server test
pnpm --filter @nexus-talent/web test
```

### End-to-End (Playwright)

```bash
pnpm run test:e2e
```

Ejecuta 10 tests en chromium:
- Smoke de landing page
- Auth: register, login, logout, protected redirect
- Analysis: submit + validation
- History: list + empty state
- Usa base de datos SQLite efímera por ejecución

---

## SDD (Spec-Driven Development)

Este repositorio sigue SDD con artefactos en `openspec/` y memoria persistente en Engram.

Ciclo completo:
1. `sdd-init` → 2. `sdd-explore` → 3. `sdd-propose` → 4. `sdd-spec`
→ 5. `sdd-design` → 6. `sdd-tasks` → 7. `sdd-apply` → 8. `sdd-verify` → 9. `sdd-archive`

Ver `AGENTS.md` para reglas detalladas de trabajo y contexto del proyecto.

---

## Convenciones

- **Commits**: Conventional Commits. Título en inglés, descripción en español.
- **React 19**: Sin useMemo/useCallback (React Compiler lo maneja). Named exports.
- **TypeScript**: Strict mode. Sin `any`. Prefer `interface` sobre `type` para props.
- **Zod**: Schemas compartidos en `shared/contracts/` son la única fuente de verdad.
- **No-Line Rule**: Separar por contraste de fondo o ghost borders, no por líneas sólidas de 1px.
- **UX States**: Todo proceso asíncrono debe tener estados Loading, Success, Error y Empty.
- **0 sobreingeniería**: Clara sobre ingeniosa. Si no hace falta, no está.

---

## Estado del Proyecto

- ✅ P1: Infraestructura (monorepo, Prisma, Express skeleton, Render deploy)
- ✅ P2: Auth Backend (JWT custom, email/password, Google OAuth)
- ✅ P3: AI Proxy (Groq server-side, Zod validation)
- ✅ P4: History API (CRUD de analyses)
- ✅ P5: Frontend Refactor (AuthProvider, TanStack Query, Zustand)
- ✅ P6: Design Identity + GEO Foundation (OKLCH, tipografía, landing, SSR, SEO)
- ✅ P7: E2E + Security (Playwright, CSP, rate limiting, logging)
- 🔄 P8: Polish + Deploy (error boundaries, skeletons, docs, Vercel proxy)
