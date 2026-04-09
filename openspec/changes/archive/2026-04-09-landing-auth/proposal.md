# Proposal: Landing and Auth UI Parity

## Intent
Migrate the public-facing pages (Landing, Login, Signup) from the static Stitch HTML reference (`docs/assets/referenciaLanding.html`) to React components. This ensures pixel-perfect fidelity and separates the visual presentation from the existing robust Supabase authentication logic.

## Scope

### In Scope
- Create static `LandingPage` recreating the Stitch HTML landing.
- Create static `LoginPage` and `SignupPage` matching the asset's layout.
- Update routing (`src/main.tsx` or AppRouter) to serve these pages.
- Wire existing `AuthProvider` sign-in/sign-up actions into the new visually-matching forms.

### Out of Scope
- Modifying underlying Supabase auth hooks or logic (beyond wiring).
- Adding new authentication providers (e.g., Google/GitHub OAuth).
- Modifying private routing logic or session management behavior.

## Approach
**Staged UI Integration**: 
1. Build pure visual components for Landing, Login, and Signup.
2. Replace current router placeholders with these components.
3. Attach `onSubmit` handlers on the new Login/Signup forms to invoke `signIn` and `signUp` from `useContext(AuthContext)`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/landing/` | New | New static components for Landing (Hero, Features). |
| `src/features/auth/pages/` | New/Modified | Pixel-perfect Login and Signup pages to replace current or placeholders. |
| `src/layouts/AppLayout.tsx` | Modified | Ensure top-bar Login/Signup CTAs navigate correctly. |
| `src/main.tsx` (or router) | Modified | Register new public routes for `/`, `/login`, and `/signup`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth context breakage due to re-renders | Low | Keep `AuthProvider` untouched at root level. |
| Visual regression from assets | Medium | Use strict Tailwind token matching; verify against `referenciaLanding.html`. |
| Broken redirects post-login | Low | Re-use existing routing effects or redirect logic present in the shells. |

## Rollback Plan
If auth flows break or UI regressions are critical, execute `git revert` to the commit prior to this phase, which restores the old generic auth UI without touching Supabase state.

## Dependencies
- `docs/assets/referenciaLanding.html` (Visual truth)
- `src/features/auth/AuthProvider.tsx` (Logic truth)

## Success Criteria
- [ ] Landing page matches the provided design exactly (Lighthouse/accessibility preserved).
- [ ] User can log in successfully via the new UI, reaching the private shell.
- [ ] User can sign up successfully via the new UI.
