# Proposal: Module 21 - Auth UX and Social Providers

## Intent
Fix the auth entry experience so signup includes password confirmation, OAuth buttons are readable in light mode, and the auth shell no longer exposes placeholder UI, while keeping social provider enablement explicit as a Supabase dependency.

## Scope
### In Scope
- Add confirm-password validation to the signup flow.
- Fix OAuth button contrast in sign-in and sign-up forms.
- Remove or replace the placeholder help icon in the auth shell.
- Document and respect the Supabase-side provider enablement requirement.

### Out of Scope
- Rebuilding auth routes or introducing new auth screens.
- Changing the Supabase auth architecture beyond provider configuration expectations.
- Enabling LinkedIn before its provider setup is verified.

## Approach
Make the client-side auth experience safer and clearer first, then leave provider enablement as a distinct operational dependency. GitHub and Google should be treated as code + configuration; LinkedIn remains disabled until its setup is confirmed.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/features/auth/schemas/auth.ts` | Modified | Signup validation with password confirmation. |
| `src/features/auth/components/SignUpForm.tsx` | Modified | Confirm-password field and OAuth contrast fix. |
| `src/features/auth/components/SignInForm.tsx` | Modified | OAuth contrast fix. |
| `src/features/auth/components/AuthShell.tsx` | Modified | Remove or replace placeholder help icon. |
| `src/lib/supabase/oauth-providers.ts` | Modified | Keep provider flags explicit, especially LinkedIn. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Social login still fails after code changes | High | Treat Supabase provider enablement as a required separate step. |
| Signup validation changes affect existing tests | Medium | Update or add form tests alongside the schema change. |
| Contrast fixes miss another theme state | Low | Validate both light and dark theme surfaces. |

## Rollback Plan
Revert the auth form/schema and shell icon changes if they regress sign-up/sign-in behavior. Provider enablement changes in Supabase can be rolled back independently in the dashboard.

## Dependencies
- Existing auth forms and shell.
- Supabase Auth provider settings and redirect URLs.
- Existing `oauth-providers.ts` enablement map.

## Success Criteria
- [ ] Signup requires confirm password and rejects mismatches.
- [ ] OAuth buttons remain legible in light mode.
- [ ] The auth shell no longer shows placeholder help text/icon.
- [ ] Provider enablement is documented as a distinct Supabase step.