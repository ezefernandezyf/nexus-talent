# Tasks: Module 13 - Social Auth Wiring

Deferred to later modules: settings rewrite, full history redesign, and legacy cleanup.

## Phase 1: Auth contract and provider plumbing
- [x] 1.1 Extend the Supabase auth helper/provider map under `src/lib/supabase/` for GitHub and Google OAuth, with LinkedIn behind a verified config flag.
- [x] 1.2 Add the OAuth callback/session handoff route or handler used by redirects, while preserving email/password sign-in as the fallback path.
- [x] 1.3 Add a minimal theme preference helper only if `AppLayout` currently loses the user's toggle choice on reload.

## Phase 2: UI action wiring
- [x] 2.1 Wire provider buttons in the login/signup entry points to the shared OAuth action, including loading and clear error states.
- [x] 2.2 Route the landing primary CTA to the existing auth entry point and keep the public auth flow unchanged.
- [x] 2.3 Make the navbar logo navigate to the app home route without resetting shell state.
- [x] 2.4 Add privacy and 404 pages/routes, including a clear home link from 404.

## Phase 3: History interaction updates
- [x] 3.1 Make history items open the full saved analysis from stable `analysis.id`, not `matchIndex`.
- [x] 3.2 Wire a history export action to the saved analysis payload so export works without `matchIndex`.
- [x] 3.3 Remove `matchIndex` from the interaction path, or keep it only if a concrete consumer is found during implementation.
- [ ] 3.4 Keep the change limited to click/export behavior; defer any broader history redesign.

## Phase 4: Tests and verification
- [x] 4.1 Add tests for GitHub/Google provider gating, optional LinkedIn visibility, and OAuth error fallback.
- [x] 4.2 Add tests for landing CTA routing, logo home navigation, privacy page rendering, and 404 fallback.
- [x] 4.3 Add history tests for clickable items, export payloads, and `matchIndex`-free behavior.
- [x] 4.4 Verify theme persistence only covers the current toggle value and does not expand settings scope.