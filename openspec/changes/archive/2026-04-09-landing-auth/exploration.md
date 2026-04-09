## Exploration: Landing / Auth

### Current State
- Project uses React 19 + TypeScript + Vite, Tailwind 4, Zod 4, TanStack Query, Supabase for auth (detected from `package.json` and `src/lib/supabase`).
- There is an existing `AuthProvider` (`src/features/auth/AuthProvider.tsx`) wired in `src/main.tsx`.
- Visual source for Landing exists at `docs/assets/referenciaLanding.html`.
- `openspec/specs/auth/spec.md` and `openspec/changes/module-12-ui-parity` already reference auth UI work.
- No explicit `src/pages/LandingPage.tsx` found (landing currently served by assets/reference HTML), so a new page component will be created.

### Affected Areas
- `src/features/auth/AuthProvider.tsx` — existing auth context and API.
- `src/lib/supabase/client.ts` — supabase client and auth methods.
- `src/main.tsx` — where `AuthProvider` is mounted.
- `src/layouts/AppLayout.tsx` — controls header/rail where CTA and login links appear.
- `docs/assets/referenciaLanding.html` — pixel-fidelity visual reference.
- `openspec/specs/auth/spec.md` — existing auth spec to respect.

### Approaches
1. **Full landing + integrated auth** — Recreate Landing, Login and Signup from `docs/assets`, integrate Login/Signup forms directly with `AuthProvider` and Supabase flows.
   - Pros: Pixel-perfect public pages and fully functional auth in one cut.
   - Cons: Higher effort; more moving parts to verify (UI + auth flows + redirects).
   - Effort: Medium-High

2. **Staged approach (recommended)** — Implement Landing as static React page/components (pixel-fidelity) with CTA links to existing auth flows; keep `AuthProvider` and existing `features/auth` untouched initially. After Landing is stable, implement integrated Login/Signup visuals reusing `features/auth` logic.
   - Pros: Faster delivery, lower risk; preserves current auth logic; visual parity first.
   - Cons: Two-step rollout (UI first, auth visuals second).
   - Effort: Low-Medium

### Recommendation
Start with the staged approach: deliver the Landing page UI first (static components wired to router), confirm visual parity against `docs/assets/referenciaLanding.html`, then proceed to integrate Login/Signup visuals by reusing `features/auth` logic and running auth scenarios from `openspec/specs/auth/spec.md`.

### Risks
- Visual regressions if Tailwind tokens or global styles differ from the assets.
- Breaking redirects or auth flows if auth integration is changed prematurely.
- Missing asset details may require iteration against `docs/assets`.

### Ready for Proposal
Yes — ready to create `sdd-propose` for `landing-auth` outlining scope, tasks and rollback plan.
