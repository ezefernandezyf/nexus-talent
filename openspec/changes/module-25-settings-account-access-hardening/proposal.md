# Proposal: Module 25 - Settings & Account Access Hardening

## Intent
Unblock authenticated users from accessing their own settings while keeping the scope tight. The current settings surface is incorrectly gated as admin-only, which blocks standard users from theme, export, profile, linked-account, and account deletion flows they already expect.

## Scope
### In Scope
- Move settings access from `/app/admin/settings` to `/app/settings`.
- Replace admin-only guarding with auth-only protection.
- Filter desktop and mobile nav items so Settings is shown only to authenticated users.
- Wire account deletion from the existing SettingsFeature danger zone.

### Out of Scope
- Admin-only settings or maintenance controls.
- New profile schema or settings redesign.
- Broad auth/provider onboarding work beyond current linked-account state.

## Approach
Reuse the existing `SettingsFeature`, page shell, and theme/export controls. Introduce or repurpose an auth-only route guard, update route registration to `/app/settings`, and make navigation derive Settings visibility from auth state. Keep account deletion narrowly scoped to the current user session and existing Supabase/auth abstractions.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/router/*` | Modified | Route path and guard behavior for settings access. |
| `src/features/auth/*` | Modified | Auth-only protection to replace admin-only restriction. |
| `src/layouts/AppLayout.tsx` | Modified | Filter Settings exposure in desktop and mobile navigation. |
| `src/features/settings/*` | Modified | Wire account deletion and keep current settings sections intact. |
| `src/pages/SettingsPage.tsx` | Possibly modified | Route target and page composition if needed. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Navigation mismatch leaves public users seeing broken Settings links | Medium | Build nav items from auth state and verify both desktop and mobile surfaces. |
| Account deletion wiring touches auth/session boundaries | Medium | Keep deletion logic isolated and covered by focused tests. |
| Route rename breaks existing links | Medium | Add redirects or update all known entry points in the same change. |

## Rollback Plan
Revert the route path, guard, and nav filtering changes first, restoring the current admin-only behavior. Keep the existing `SettingsFeature` and page implementation intact so the rollback is limited to access control and navigation wiring.

## Dependencies
- Existing auth/session state must reliably distinguish authenticated vs public users.
- Supabase/auth deletion capability must be available or stubbed through the current account service.
- Current SettingsFeature sections must remain stable as the access model changes.

## Success Criteria
- [ ] Any authenticated user can open `/app/settings`.
- [ ] Public users do not see Settings in desktop or mobile navigation.
- [ ] The existing settings sections still render and function after the route change.
- [ ] Account deletion is wired to a real action, not just a visual confirmation.
- [ ] Existing admin-only behavior is no longer required for user settings access.
