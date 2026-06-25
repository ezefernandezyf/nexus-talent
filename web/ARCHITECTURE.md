# Nexus Talent — Frontend Architecture

## Screaming Architecture

The frontend follows **Screaming Architecture**: the top-level folder structure tells you what the application does, not what framework it uses. Business domains are first-class citizens.

```
web/src/
├── core/              # Framework plumbing, infrastructure
│   ├── components/    # ErrorBoundary (infrastructure-level)
│   ├── api-client.ts  # Axios instance + request/response interceptors
│   ├── router.tsx     # React Router 7 route definitions
│   ├── query-client.ts
│   ├── logger.ts
│   ├── toast.ts
│   ├── theme.tsx
│   └── error-mapper.ts
│
├── features/          # Business domains — "what the app does"
│   ├── auth/          # Entrar/registrarse, sesión, guards
│   │   ├── api/       # Server communication (React Query hooks)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/   # Zod schemas (form validation local al feature)
│   │   ├── store/     # Zustand (UI state only — status)
│   │   ├── AuthProvider.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicAuthRoute.tsx
│   │   └── index.ts
│   │
│   ├── analysis/      # Job description analysis
│   │   ├── api/
│   │   ├── components/
│   │   ├── export/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── history/       # Analysis history
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── index.ts
│   │
│   ├── settings/      # User settings & profile
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── index.ts
│   │
│   └── landing/       # Public marketing pages (/, /privacy)
│       ├── components/
│       └── pages/
│
├── shared/            # Generic, reusable, domain-agnostic
│   ├── components/    # UI primitives: Button, Card, Input, Badge, Modal, etc.
│   ├── layouts/       # AppLayout (sidebar + header shell)
│   ├── pages/         # NotFoundPage (no domain coupling)
│   └── utils/         # cn() utility
│
├── test/              # Test infrastructure
│   ├── factories/     # Test data factories
│   ├── mocks/         # MSW handlers, query client wrapper
│   └── setup.ts       # Vitest global setup
│
├── App.tsx            # Root component (renders AppRouter)
└── main.tsx           # Entry point (providers + router)
```

## Folder Convention

| Path | What goes here | What does NOT go here |
|------|---------------|----------------------|
| `core/` | Infrastructure: API client, router, logger, theme, query client, error boundary | Business logic, UI components |
| `features/{domain}/` | Everything for one business domain | Cross-domain concerns, shared UI |
| `features/{domain}/api/` | API hooks (React Query), HTTP clients, mappers, validations | UI components, pages |
| `features/{domain}/components/` | React components for this domain | Pages (use `pages/`), API logic |
| `features/{domain}/pages/` | Page-level components (one per route) | Reusable UI (use `components/`) |
| `features/{domain}/store/` | Zustand stores (ephemeral UI state) | Server state (use React Query) |
| `features/{domain}/schemas/` | Zod schemas for forms within this domain | Shared contracts (use `shared/contracts/`) |
| `shared/` | Reusable, domain-agnostic code | Anything tied to a business domain |
| `shared/components/` | UI primitives — Button, Card, Input, Modal, Badge | Domain-specific components |
| `test/` | Test factories, mocks, setup | Production code |

## Path Aliases

Configured in both `vite.config.ts` (Vite resolve) and `tsconfig.app.json` (TypeScript).

| Alias | Resolves to | Use for |
|-------|------------|---------|
| `@` | `web/src` | Entry points (`@/App`, `@/main`) |
| `@/core` | `web/src/core` | Infrastructure: API client, router, theme |
| `@/shared` | `web/src/shared` | Shared UI components, layouts, utils |
| `@/features` | `web/src/features` | Any business domain |
| `@/test` | `web/src/test` | Test factories, mocks |

### Before → After

```typescript
// Before — brittle relative imports
import { Button } from "../../../components/ui/Button";
import { apiClient } from "../../core/api-client";
import { useSession } from "../auth/api/useSession";
import { cn } from "../../shared/utils/cn";

// After — explicit, refactor-safe aliases
import { Button } from "@/shared/components/Button";
import { apiClient } from "@/core/api-client";
import { useSession } from "@/features/auth/api/useSession";
import { cn } from "@/shared/utils/cn";
```

## State Management Rules

- **React Query** for all server state: session, analyses, history, settings
- **Zustand** ONLY for ephemeral UI state: auth status (`authenticated | unauthenticated | unknown`), form view state
- **No localStorage** for data persistence (backend-only)

## Key Conventions

- **React 19**: no `useMemo`/`useCallback` (React Compiler handles it), named imports only
- **TypeScript**: strict mode, never `any`, `as const` pattern for string literals
- **ESLint + Prettier**: run on every change via `pnpm run lint && pnpm run format`
- **Zod**: shared schemas in `shared/contracts/` are the single source of truth
- **UX States**: every async process must handle Loading, Success, Error, and Empty states

## Testing

- **Unit/Integration**: Vitest with `@testing-library/react`, MSW for API mocking
- **E2E**: Playwright with ephemeral SQLite, auth fixtures
- **Coverage threshold**: 90% (lines, functions, branches, statements)

## SSR

- Build-time prerender for `/` (LandingPage) and `/privacy` (PrivacyPage)
- Vite SSR plugin in `web/vite.config.ts` via `ssrPlugin()` + `web/ssr/renderer.tsx`
- Prerender script at `web/scripts/prerender.mjs`
