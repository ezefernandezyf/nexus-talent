# Design: P8 — Polish + Deploy

## Technical Approach

Five independent capabilities are applied in parallel across the frontend, deploy config, and docs. UX resilience wires existing components (`LoadingSkeleton`, `EmptyState`) into existing pages. Deploy infra adds Vercel API proxy + Render Blueprint. AuthShell gets a visual-only token swap. Lighthouse is validated (not built). Docs are written from conventions.

## Architecture Decisions

### ErrorBoundary → /500 navigation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `window.location.href = '/500'` | Full page reload — clean tree, no corrupted state | **Chosen** |
| React Router `navigate()` | Keeps React tree alive, risk of corrupted child state | Rejected |
| Inline error card (current) | No dedicated route, no recovery path | Rejected |

After an unhandled render error the component tree is unpredictable. A hard navigation ensures a clean mount and avoids memory/corruption issues.

### ServerErrorPage placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `shared/pages/ServerErrorPage.tsx` | Domain-agnostic, follows NotFoundPage convention | **Chosen** |
| `features/error/pages/` | Over-engineered for a single infrastructure page | Rejected |
| Inline in ErrorBoundary | No route, can't be navigated to directly | Rejected |

### SettingsPage skeleton trigger

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `status === 'loading' \|\| status === 'unknown'` | Covers initial mount + session fetch | **Chosen** |
| `status === 'unknown'` only | Misses loading state flash | Rejected |

AuthProvider sets `status = "loading"` during `useSession()` fetch, initial Zustand default is `"unknown"`. Both must be covered.

### AuthShell: visual-only token swap

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Replace `rgba()` with OKLCH `color-mix()` + CSS vars | Zero logic change, minimal diff | **Chosen** |
| Rewrite AuthShell internals | Risk of breaking OAuth flow, spec says visual-only | Rejected |

DOM structure, form submission, and OAuth button hierarchy remain identical. Only gradient colors, copy strings, and footer link colors change.

### Vercel rewrite order

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `/api/(.*)` rewrite BEFORE catch-all | API hits proxy, SPA routes fall through | **Chosen** |
| `/api/(.*)` after catch-all | Catch-all swallows API routes first | Rejected |

Vercel rewrites are evaluated top-to-bottom; first match wins.

## Data Flow

```
                      ErrorBoundary
                      catches error
                           │
                           ▼
                 window.location.href = '/500'
                           │
                           ▼
                   ServerErrorPage renders
                   "Recargar aplicación" → location.reload()

SettingsPage:
  useAuth().status ──→ "loading" / "unknown" ──→ <LoadingSkeleton variant="hero" />
                   ──→ "authenticated"    ──→ <SettingsFeature />

AnalysisFeature:
  useJobAnalysis().isIdle ──→ <EmptyState title="No hay análisis todavía" />
  useJobAnalysis().isPending ──→ <LoadingState />
  useJobAnalysis().isError   ──→ <ErrorState />
  useJobAnalysis().data      ──→ <AnalysisCard />

Vercel request:
  /api/auth/me ──→ rewrite to https://nexus-talent.onrender.com/api/auth/me
  /app/analysis ──→ serve index.html (SPA catch-all)
  / ──→ serve landing.html (prerender)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `web/src/core/components/ErrorBoundary.tsx` | Modify | Navigate to `/500` via `window.location.href` on catch. Remove inline Card fallback. |
| `web/src/shared/pages/ServerErrorPage.tsx` | Create | 500 page with "Recargar aplicación" button, styled as `surface-panel` matching NotFoundPage. |
| `web/src/core/router.tsx` | Modify | Add `<Route path="/500" element={<ServerErrorPage />} />` before catch-all. |
| `web/src/features/settings/pages/SettingsPage.tsx` | Modify | Wrap content in conditional: show `<LoadingSkeleton variant="hero" />` when `status` is `'loading'` or `'unknown'`. |
| `web/src/features/analysis/AnalysisFeature.tsx` | Modify | Replace `null` fallback (line 99-100) with `<EmptyState title="No hay análisis todavía" description="Pegá una descripción del puesto para obtener un análisis completo." />`. |
| `web/src/features/auth/components/AuthShell.tsx` | Modify | Replace `rgba(142, 213, 255, ...)` / `rgba(56, 189, 248, ...)` gradients with OKLCH `color-mix(in oklch, var(--color-accent) ...)`. Replace `AUTH_SHELL_COPY` strings: remove Supabase/RLS references, use JWT-agnostic wording. Swap footer link colors from `#38BDF8` to `var(--color-primary)`. |
| `web/src/features/auth/components/AuthForm.tsx` | Delete | Unused wrapper — AuthShell renders children directly via Card. |
| `vercel.json` | Modify | Add `{ "source": "/api/(.*)", "destination": "https://nexus-talent.onrender.com/api/$1" }` as first rewrite entry, before prerender routes. |
| `render.yaml` | Create | Render Blueprint: web service, Dockerfile path `server/Dockerfile`, health check `/health`, env vars `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `CORS_ORIGIN`. |
| `DESIGN.md` | Create | Design system doc: palette (OKLCH tokens), typography (Cabinet Grotesk + Satoshi), spacing/radii/shadow tokens, component patterns (buttons, cards, inputs, modals), dark-first strategy with light variant, anti-convergence rationale. |
| `README.md` | Modify | Full rewrite: current stack (React 19, Express 5, Prisma 7, TanStack Query, Zustand, Playwright), pnpm monorepo layout (`server/`, `web/`, `shared/`, `e2e/`), run commands, screaming arch diagram, Vercel + Render deploy guide, env var table. |

## Interfaces / Contracts

No new TypeScript interfaces or Zod schemas. The `EmptyState` and `LoadingSkeleton` props are already defined in `web/src/shared/components/`. The `ServerErrorPage` is a standalone component with no props.

```typescript
// ServerErrorPage — no props, fully self-contained
// Uses window.location.reload() for retry, matching NotFoundPage pattern
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | AnalysisFeature empty state renders when idle | Mock `useJobAnalysis` to return `{ isIdle: true }`, assert `EmptyState` is rendered |
| Unit | SettingsPage skeleton on loading status | Mock `useAuth` to return `{ status: 'loading' }`, assert `LoadingSkeleton` is rendered |
| Unit | ErrorBoundary navigates to /500 | Stub `window.location`, catch error in child, assert href was set |
| Manual | `/500` route renders correctly | Navigate to `/500` in browser, verify retry reloads app |
| Manual | AuthShell visual tokens | Visual diff on `/auth/sign-in` — no sky-blue, no Supabase text |
| Manual | Vercel proxy | Preview deploy: `/api/auth/me` returns 200 from Render |
| E2E | Login flow after AuthShell redesign | Existing Playwright auth smoke test passes |

## Migration / Rollout

No migration required. All changes are additive or visual-only. `vercel.json` change is active on next deploy. `render.yaml` is consumed by Render on push.

## Open Questions

- [ ] Confirm `"loading"` is the correct status value during session fetch (vs `"unknown"` on initial mount) — verified in AuthProvider: `unknown` is initial Zustand default, then `loading` during fetch, then `authenticated`/`unauthenticated`. Both must be handled.
