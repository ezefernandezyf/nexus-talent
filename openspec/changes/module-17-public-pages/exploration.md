# Exploration: Module 17 - Public Pages

## Current State

- `src/pages/PrivacyPage.tsx` and `src/pages/NotFoundPage.tsx` already exist and are routed from `src/router/AppRouter.tsx`.
- `src/components/ui/Footer.tsx` already links to `/privacy` and is rendered in both the landing page and authenticated shell.
- `src/router/AppRouter.test.tsx` already covers `/privacy` and unknown-route `404` behavior.
- No dedicated page/component tests exist for privacy, 404, or the shared footer.

## Affected Areas
- `src/pages/PrivacyPage.tsx` — public informational page to verify.
- `src/pages/NotFoundPage.tsx` — public fallback page to verify.
- `src/components/ui/Footer.tsx` — shared footer privacy navigation to verify.
- `src/pages/LandingPage.tsx` — public shell surface that renders the shared footer.
- `src/layouts/AppLayout.tsx` — authenticated shell surface that renders the shared footer.
- `src/router/AppRouter.test.tsx` — existing route regression coverage.

## Approaches
1. **Verification-only hardening** — add direct tests for privacy, 404, and footer links.
   - Pros: minimal scope, aligns with already-implemented behavior, low risk.
   - Cons: no user-visible feature work if the existing pages are already correct.
   - Effort: Low.

2. **Copy/structure refinement** — tweak public page copy and footer labeling for consistency.
   - Pros: can improve polish and route clarity.
   - Cons: expands beyond verification, risks overlapping UI parity work.
   - Effort: Low/Medium.

## Recommendation

Proceed with verification-only hardening. The public pages and routes already exist, so the highest-value work is direct coverage for those surfaces and the shared footer link behavior.

## Risks
- Scope drift into UI parity or copy rewrites.
- Duplicating coverage already present at router level without adding new guarantees.

## Ready for Proposal
Yes — the next step should define a small verification-focused change that adds page/footer tests without changing routes.