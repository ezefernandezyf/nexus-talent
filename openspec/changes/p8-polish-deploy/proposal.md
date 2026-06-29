# Proposal: P8 - Polish + Deploy

## Intent

Nexus Talent is feature-complete (P1–P7 done) but lacks production polish: no 500 error page, no skeleton on settings page, no API proxy from Vercel to Render, no render.yaml, README is outdated, and auth pages still reference Supabase and use sky-blue gradients instead of "The Signal" (Indigo/Chartreuse). Lighthouse is untested. Deploy is not production-guided.

## Scope

### In Scope
- **500 error page** - dedicated server-error route with retry + messaging
- **SettingsPage skeleton** - skeleton loader while settings data fetches
- **Analysis "no analysis yet" state** - guidance before first run
- **Vercel API proxy** - `/api/*` rewrites → Render backend in `vercel.json`
- **render.yaml** - Render Blueprint with health check, Dockerfile path, env vars
- **Lighthouse 90+** - Core Web Vitals on mobile (LCP < 2.5s, CLS < 0.1)
- **Auth redesign** - AuthShell aligned to Indigo/Chartreuse, Cabinet Grotesk + Satoshi, remove Supabase references (deferred from P6)
- **DESIGN.md** - design system doc based on portfolio-personality principles
- **README rewrite** - current stack, pnpm monorepo, architecture, run commands

### Out of Scope
- New features (V1.2 work: profiles, CV generator, brand building)
- SSR changes beyond existing prerender
- Google Search Console submission (manual)
- E2E test expansion (existing 10 tests pass)

## Capabilities

> Research: `openspec/specs/` is empty - no existing specs to modify.

### New Capabilities
- `ux-resilience`: Error boundary polish, skeleton loading, empty states across analysis/history/settings
- `deploy-infra`: Vercel `/api/*` → Render proxy, render.yaml, health check verification
- `lighthouse-perf`: Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1) on mobile
- `design-identity`: Auth pages aligned to "The Signal" (Indigo/Chartreuse, Cabinet Grotesk + Satoshi)
- `project-docs`: DESIGN.md (portfolio-personality principles) + README (stack, arch, run)

### Modified Capabilities
None - no existing specs in `openspec/specs/`.

## Approach

1. **Frontend UX**: Wire existing `LoadingSkeleton` into `SettingsPage`. Add 500 page at route `/500`. Conditionally render `EmptyState` in `AnalysisFeature` when no data and not loading.
2. **Deploy**: Add `{ "source": "/api/(.*)", "destination": "https://nexus-talent.onrender.com/api/$1" }` to `vercel.json` rewrites. Create `render.yaml` with Dockerfile path and health check path.
3. **Perf**: Audit bundle with `vite-bundle-visualizer`. Lazy-load heavy deps. Add `font-display: swap` to Cabinet Grotesk. Optimize images. Verify with Lighthouse CLI.
4. **Auth redesign**: Replace AuthShell sky-blue gradients with Indigo/Chartreuse OKLCH tokens. Remove Supabase conditioning (now custom JWT). Use Cabinet Grotesk for headings.
5. **Docs**: DESIGN.md from `portfolio-personality` principles. README: current stack, pnpm commands, screaming arch diagram, deploy guide.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/core/components/ErrorBoundary.tsx` | Modified | Add 500 route integration |
| `web/src/shared/pages/` | New | `ServerErrorPage.tsx` (500) |
| `web/src/features/analysis/AnalysisFeature.tsx` | Modified | Add empty state when no analysis |
| `web/src/features/settings/pages/SettingsPage.tsx` | Modified | Add LoadingSkeleton |
| `web/src/features/auth/components/AuthShell.tsx` | Modified | Redesign to The Signal |
| `web/src/features/auth/components/AuthForm.tsx` | Modified | Remove, unused |
| `vercel.json` | Modified | Add `/api/*` proxy rewrite |
| `render.yaml` | New | Render Blueprint config |
| `DESIGN.md` | New | Design system documentation |
| `README.md` | Modified | Full rewrite |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Vercel/Render CORS mismatch with proxy | Low | CORS_ORIGIN already configurable; test in preview deploy |
| Lighthouse CLS from lazy-loaded routes | Med | Reserve space with `min-height` on Suspense boundaries |
| AuthShell redesign breaks OAuth flow | Low | Only visual tokens change; keep DOM structure |

## Rollback Plan

- **vercel.json**: revert to previous rewrite config (SPA fallback only)
- **AuthShell**: git revert the component file - visual-only change, no logic
- **render.yaml**: delete file; Render Blueprint is additive, not destructive

## Dependencies

- Render account + `RENDER_SERVICE_ID` for backend URL in Vercel proxy
- `openssl rand -hex 32` for `JWT_SECRET` in Render env

## Success Criteria

- [ ] 500 page accessible at `/500` with retry button
- [ ] Settings page shows skeleton while loading
- [ ] Analysis page shows "no analysis yet" empty state before first run
- [ ] `vercel.json` proxies `/api/*` to Render backend in preview deploy
- [ ] `render.yaml` passes Render Blueprint validation
- [ ] Lighthouse mobile score ≥ 90 (Performance)
- [ ] Auth pages use Indigo/Chartreuse palette, no Supabase references
- [ ] DESIGN.md covers palette, typography, spacing, component patterns
- [ ] README includes pnpm commands, screaming arch diagram, deploy guide
