# Design: Module 21 - Auth UX and Social Providers

## Technical Approach

Apply focused client-side changes to the auth schema and forms, remove the placeholder control from the auth shell, and keep social provider enablement explicit in the Supabase provider map. Treat Supabase dashboard configuration as a prerequisite for full OAuth functionality, not as an implementation detail hidden in the UI.

## Architecture Decisions

### Decision: Add confirm-password validation in the schema

**Choice**: Extend the signup schema with a confirm-password field and mismatch validation.
**Alternatives considered**: Validate only in the component.
**Rationale**: Schema-level validation is reusable and keeps the form contract consistent.

### Decision: Fix OAuth contrast with theme-aware classes

**Choice**: Add explicit text color handling to the GitHub and Google buttons.
**Alternatives considered**: Leave button colors as inherited styles.
**Rationale**: The buttons must stay readable in light mode regardless of parent theme inheritance.

### Decision: Remove placeholder auth shell UI

**Choice**: Replace the help_outline placeholder with intentional UI or remove it.
**Alternatives considered**: Keep the placeholder as a future affordance.
**Rationale**: The auth shell should not expose non-functional controls.

### Decision: Keep provider enablement explicit

**Choice**: Preserve provider flags and document Supabase-side enablement as required.
**Alternatives considered**: Attempt to hide config gaps behind the UI.
**Rationale**: OAuth enablement is a product + infra concern, so the code should make that dependency obvious.

## Data Flow

User -> Auth shell -> Sign in / sign up form -> Schema validation -> Supabase auth provider -> Session

For OAuth, the flow remains the same but now depends on both the frontend provider config and Supabase dashboard setup.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/auth/schemas/auth.ts` | Modify | Add confirm-password validation. |
| `src/features/auth/components/SignUpForm.tsx` | Modify | Add confirm-password input and improve OAuth button contrast. |
| `src/features/auth/components/SignInForm.tsx` | Modify | Improve OAuth button contrast. |
| `src/features/auth/components/AuthShell.tsx` | Modify | Replace or remove the placeholder help control. |
| `src/lib/supabase/oauth-providers.ts` | Modify | Preserve explicit provider enablement flags and provider labels. |

## Interfaces / Contracts

The signup form contract gains a confirm-password field that is validated locally before submission.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Regression | Signup validation | Ensure mismatched passwords are rejected before submission. |
| Regression | OAuth button rendering | Validate readable labels in light mode. |
| Regression | Auth shell rendering | Confirm the placeholder control is gone or replaced. |
| Regression | Provider enablement messaging | Verify disabled providers are surfaced clearly. |

## Migration / Rollout

No migration required, but Supabase provider settings must be verified before claiming social auth is fully active.

## Open Questions

- Should LinkedIn stay hidden until enabled, or be shown as disabled with a clear message?