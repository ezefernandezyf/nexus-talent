# Proposal: module-07-auth-users

## Intent

Implement an incremental Authentication shell (Sign In/Up, Session Management, basic RLS) to secure future features, without immediately migrating the existing local-first history to avoid data loss risks.

## Scope

### In Scope
- Supabase Authentication integration (Email/Password).
- Auth Context/Provider and Session Management in React.
- Route protection (Public/Private routes).
- Basic RLS (Row Level Security) scaffolding.

### Out of Scope
- Migrating existing local `history` data to Supabase.
- Complex role-based access control (RBAC).

## Approach

Integrate Supabase Auth to handle session management securely. Implement a clean "Auth Shell" (UI components for login/signup). Use an `AuthProvider` via context to manage user state globally, combined with protected routing. We deliberately defer migrating the local history to a later phase to ensure zero data loss.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/supabase/` | New | Supabase client setup & auth utilities |
| `src/features/auth/` | New | Auth components, Context, and Hooks |
| `src/App.tsx` | Modified| Wrap with AuthProvider and set up private routes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Session synchronization | Low | Actively listen to Supabase auth state changes (`onAuthStateChange`) |
| Silent data loss | Low | Explicitly keeping local history separate and decoupled for now |

## Rollback Plan

Revert Git commits related to the auth feature. Remove `AuthProvider` from `App.tsx` and revert route protection to make all routes public again.

## Dependencies

- `@supabase/supabase-js`

## Success Criteria

- [ ] Users can sign up, sign in, and log out successfully.
- [ ] Session state persists across page hard-reloads.
- [ ] Unauthorized users attempting to access protected routes are redirected.