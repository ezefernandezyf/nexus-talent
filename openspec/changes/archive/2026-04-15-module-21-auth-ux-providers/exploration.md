# Exploration: Module 21 - Auth UX and Social Providers

### Current State
The auth surface already has email/password and OAuth entry points for GitHub and Google. The current gaps are mostly UX and provider configuration boundaries: signup lacks password confirmation, OAuth buttons have theme contrast issues in light mode, the auth shell still exposes a help_outline placeholder, and provider enablement can fail unless Supabase is configured correctly.

### Affected Areas
- `src/features/auth/schemas/auth.ts` — signup schema needs confirmation password validation.
- `src/features/auth/components/SignUpForm.tsx` — missing confirm-password input and light-theme OAuth contrast issue.
- `src/features/auth/components/SignInForm.tsx` — same OAuth contrast issue on the sign-in form.
- `src/features/auth/components/AuthShell.tsx` — placeholder help icon needs replacement or removal.
- `src/lib/supabase/oauth-providers.ts` — code-side provider enablement flags, especially LinkedIn.
- Supabase Auth dashboard — GitHub/Google provider configuration and redirect URLs.

### Approaches
1. **Tight UX fix + explicit provider notes** — add confirm-password validation, fix button contrast, and remove the placeholder auth icon while documenting Supabase provider setup as a prerequisite.
   - Pros: minimal, focused, and low-risk; separates code from config clearly.
   - Cons: still requires external Supabase dashboard work to fully enable social login.
   - Effort: Low/Medium.

2. **Broader auth shell redesign** — redesign the auth entry UI and provider management surface together.
   - Pros: more cohesive UX.
   - Cons: larger scope, unnecessary for the current blockers, and risks mixing config work with layout work.
   - Effort: Medium/High.

### Recommendation
Use the tight UX fix and keep provider enablement explicit. The module should cover the client-side validation and visual issues, then document the Supabase provider prerequisites so GitHub/Google/LinkedIn behavior is not mistaken for a frontend-only problem.

### Risks
- OAuth failures may still appear until the Supabase dashboard is correctly configured.
- LinkedIn is already intentionally disabled in code and should not be forced on before its provider setup is verified.
- Auth changes can ripple into existing tests if the form schemas or labels shift.

### Ready for Proposal
Yes — the next step should formalize a narrow auth UX/provider delta with explicit Supabase dependency notes.