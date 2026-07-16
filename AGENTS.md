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
- **Package Manager**: pnpm (workspace monorepo)

## Architecture
- **Full Screaming Architecture**: business domains are top-level folders in `server/src/`
- **Monorepo**: `server/`, `web/`, `shared/`, `e2e/` — each has its own `package.json` with `"type": "module"`
  - `@nexus-talent/web` — React 19 frontend
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

## Design Tools

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

## Responsabilidades Clínicas (Orchestrator vs Agents)

- **El Orquestador Principal** coordina la conversación, la creación de ramas y los commits.
- **Los Sub-agentes SDD** se limitan estrictamente a explorar, proponer, especificar, diseñar y desglosar tareas de forma asíncrona.
- La creación de carpetas, archivos y código corresponde a la fase de implementación (`sdd-apply`).
- Los sub-agentes **no deben** crear ramas ni hacer commits por su cuenta. Son ejecutores de fases.
- **Regla de Hierro**: Toda decisión se toma antes de escribir código. No hay implementación sin spec y diseño aprobados.

---

## Active Phases

| Phase | Estado | Descripción |
|-------|--------|-------------|
| **Phase 1 — Polish** | ✅ Completado (#86) | Sacar GitHub URL, validar JD ≥30 chars, reemplazar em dashes, remover eyebrow labels en CV y Settings |
| **Phase 2 — CV Hub en Settings** | ✅ Completado (#87-89) | Settings tipo CV Hub: Accordion, Educación CRUD, Experiencia CRUD, Skills con Tags, Contacto (teléfono, email, portfolio, LinkedIn, GitHub) |
| **Phase 3 — CV + Analysis unificado** | ✅ Completado (#90-93) | Página única (/app/cv): JD + ad-hoc items + orden + tono → CV preview/export + Analysis output. Estilo Lapis CV. Secciones sin datos ocultas. CV manager pages eliminadas |
| **Phase 4 — Polish II** | 🔲 Pendiente | Navbar (CV→Historial→Settings), em dashes visibles, accordion bug (contenido visible al cerrar), títulos duplicados en secciones de accordion |
| **Phase 5 — CV Builder** | 🔲 Pendiente | Projects section en Settings (separado de Experiencia), mejorar prompt CV con reglas cv-builder (anti-AI voice, header nombre/contacto, ATS) |

> Las phases se ejecutan con SDD una por una. Cada una pasa por: explore → propose → spec → tasks → apply → verify → archive.
