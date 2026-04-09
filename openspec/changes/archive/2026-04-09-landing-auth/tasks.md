# Tasks: landing-auth

## Goal
Deliver pixel-faithful Landing, Login and Signup pages and wire them to the existing `AuthProvider` without changing authentication logic.

## Tasks
1. Extraer HTML/CSS de referencia
   - Output: `docs/assets/referenciaLanding.html` sections mapped to components (Hero, Features, Footer)
   - Acceptance: HTML snippets captured and annotated with responsive breakpoints

2. Crear skeleton de página
   - Create `src/features/landing/pages/LandingPage.tsx` with router entry `/`
   - Acceptance: Page renders static components with placeholder content

3. Implementar componentes dumb
   - `Hero`, `FeatureList`, `Footer` under `src/features/landing/components/`
   - Acceptance: Each component matches the visual structure and supports props for dynamic text

4. Crear `AuthForm` dumb component
   - `src/features/auth/components/AuthForm.tsx` — props: `onSubmit`, `isLoading`, `errors`
   - Acceptance: Renders form fields and exposes submit event without business logic

5. Implementar `LoginPage` y `SignupPage`
   - Smart wrappers use `react-hook-form` + Zod and render `AuthForm`
   - Acceptance: Validate inputs client-side and call context methods on valid submit

6. Añadir rutas públicas
   - Register `/`, `/login`, `/signup` in the router (`src/main.tsx` or `src/router/*`)
   - Acceptance: Navigation between pages works and CTAs point to expected routes

7. Wire con `AuthProvider`
   - Use `AuthContext` `signIn` and `signUp` in `LoginPage`/`SignupPage`
   - Acceptance: Successful auth redirects to private shell; errors are shown inline

8. Estados UI
   - Implement loading, success, and error states in forms
   - Acceptance: UX displays appropriate states during requests

9. Validación con Zod
   - Add `src/features/auth/schemas/auth.ts` with `loginSchema` and `signupSchema`
   - Acceptance: Invalid submits prevented; errors displayed inline

10. Tests unitarios
    - Vitest + RTL tests for `AuthForm` render and schema behavior
    - Acceptance: Tests for validation and submit wiring

11. QA visual
    - Pixel-check key breakpoints against `docs/assets/referenciaLanding.html`
    - Acceptance: No visual regressions in desktop/tablet/mobile samples

12. Accessibility & Lighthouse spot-check
    - Basic a11y pass and Lighthouse smoke
    - Acceptance: No critical accessibility violations; perf/seo best-effort

13. PR & Rollback
    - Prepare PR description, checklist, and rollback steps (`git revert <commit>`)
    - Acceptance: PR has testing checklist and visual QA steps

## Deliverables
- `openspec/changes/landing-auth/` updated with `proposal.md`, `exploration.md`, `design.md`, `specs/ui/spec.md`, and this `tasks.md`
- New files under `src/features/landing` and `src/features/auth` implementing the UI and wiring

## Notes
- Do NOT change `src/features/auth/AuthProvider.tsx` internals; only call its public methods.
- Keep styles consistent with the design tokens in `DESIGN.md` and Tailwind config.
