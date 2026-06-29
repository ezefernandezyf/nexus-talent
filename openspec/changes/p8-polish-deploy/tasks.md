# Tasks: P8 - Polish + Deploy

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~400 across 11 files |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full P8 polish + deploy | PR 1 | All 5 capabilities; under 400-line budget |

## Phase 1: UX Resilience (RED → GREEN)

- [x] 1.1 RED: Write unit test for ErrorBoundary navigating to `/500` - stub `window.location`, throw in child, assert `href` was set
- [x] 1.2 RED: Write unit test for SettingsPage rendering `<LoadingSkeleton variant="hero" />` when `status === "loading"`
- [x] 1.3 RED: Write unit test for AnalysisFeature rendering `<EmptyState>` when `isIdle === true` and no data
- [x] 1.4 GREEN: Create `web/src/shared/pages/ServerErrorPage.tsx` - "Recargar aplicación" button, `surface-panel` styling matching NotFoundPage
- [x] 1.5 GREEN: Modify `web/src/core/components/ErrorBoundary.tsx` - remove inline Card fallback, add `window.location.href = '/500'` on catch
- [x] 1.6 GREEN: Modify `web/src/core/router.tsx` - add `<Route path="/500" element={<ServerErrorPage />} />` before catch-all
- [x] 1.7 GREEN: Modify `web/src/features/settings/pages/SettingsPage.tsx` - wrap content in conditional, render `<LoadingSkeleton variant="hero" />` when status is `"loading"` or `"unknown"`
- [x] 1.8 GREEN: Modify `web/src/features/analysis/AnalysisFeature.tsx` - replace `null` fallback with `<EmptyState title="No hay análisis todavía" description="Pegá una descripción del puesto para obtener un análisis completo." />`
- [x] 1.9 Verify: run `pnpm --filter @nexus-talent/web test`, all 3 unit tests pass

## Phase 2: Deploy Infrastructure

- [x] 2.1 Modify `vercel.json` - add `{ "source": "/api/(.*)", "destination": "https://nexus-talent.onrender.com/api/$1" }` as first rewrite entry before SPA catch-all and prerender routes
- [x] 2.2 Create `render.yaml` - web service: Dockerfile path `server/Dockerfile`, health check `/health`, env vars DATABASE_URL, JWT_SECRET, GROQ_API_KEY, CORS_ORIGIN

## Phase 3: Design Identity

- [x] 3.1 Modify `web/src/features/auth/components/AuthShell.tsx` - replace `rgba(142,213,255,…)` and `rgba(56,189,248,…)` gradients with `color-mix(in oklch, var(--color-accent) …)` OKLCH tokens; remove Supabase/RLS from AUTH_SHELL_COPY strings; swap footer link colors to `var(--color-primary)`
- [x] 3.2 Delete `web/src/features/auth/components/AuthForm.tsx` and its import in AuthShell
- [x] 3.3 Verify: run Playwright auth smoke test (`pnpm --filter @nexus-talent/e2e test`), confirm login/register/OAuth flow intact

## Phase 4: Performance, Lighthouse & Documentation

- [x] 4.1 Add `font-display: swap` to Cabinet Grotesk `@font-face` declarations in global CSS if not already present - already present, no change needed
- [ ] 4.2 Run Lighthouse mobile audit on Vercel preview deploy; verify Performance ≥ 90, LCP < 2.5s, CLS < 0.1
- [x] 4.3 Create `DESIGN.md` - Indigo/Chartreuse OKLCH palette, Cabinet Grotesk + Satoshi typography, spacing/radii/shadow tokens, component patterns (buttons, cards, inputs, modals), dark-first strategy, portfolio-personality anti-convergence rationale
- [x] 4.4 Rewrite `README.md` - stack (React 19, Express 5, Prisma 7, TanStack Query, Zustand, Playwright), pnpm monorepo structure (`server/`, `web/`, `shared/`, `e2e/`), run commands, screaming arch diagram, Vercel + Render deploy guide, env var table
