# Proposal: Module 14 - Settings Rewrite

## Intent
Rebuild the user-facing settings page so it matches the discovered reference layout and exposes the account controls users actually need. This is a conservative rewrite of the settings experience, not a broader admin or platform settings overhaul.

## Scope

### In Scope
- Rework the settings page around `Account Information`, `Linked Accounts`, and `Danger Zone`.
- Wire profile edits to Supabase-backed user profile data.
- Integrate the existing AppLayout theme persistence into settings as a reflected control, without duplicating theme state.

### Out of Scope
- Admin or maintenance settings replacement.
- Broader auth provider management or new provider onboarding flows.
- Legacy cleanup, route removal, or file moves.
- A new theme storage system inside settings.

## Approach
Keep the page-level shell in `src/pages/SettingsPage.tsx` and move only user-facing form logic into the settings feature. Read/write profile data through Supabase, and derive linked-account status from the existing auth/session provider metadata. Treat the theme control as a view over the current shell-level preference, not a second source of truth.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/SettingsPage.tsx` | Modified | Page composition and section layout. |
| `src/features/settings/*` | Modified | Profile form, linked accounts, and danger-zone actions. |
| `src/lib/supabase/*` | Modified | Profile persistence and account metadata access, if not already present. |
| `supabase/migrations/*` | Conditional | Only if the `profiles` table/RLS needed for settings is missing or incomplete. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Profile schema mismatch or missing RLS | Medium | Confirm a `profiles` migration/config prerequisite before implementation. |
| Theme state duplication | Medium | Read the existing AppLayout preference instead of adding a second settings-owned source of truth. |
| Scope drift into admin or provider management | Medium | Limit the rewrite to the end-user page and defer admin/maintenance controls. |

## Rollback Plan
Revert the settings page and feature changes first. Keep the existing AppLayout theme persistence and current auth/session behavior intact so the shell remains stable while the rewrite is backed out.

## Dependencies
- Supabase profile storage must exist, or a migration/config update must be applied before implementation.
- Existing AppLayout theme persistence remains the single source of truth for theme choice.
- Existing auth/session metadata must be available to render linked account state.

## Success Criteria
- [ ] The settings page matches the reference structure with `Account Information`, `Linked Accounts`, and `Danger Zone`.
- [ ] Profile edits persist correctly through Supabase.
- [ ] Linked account state reflects the current auth session/provider data.
- [ ] The theme control reflects the already-persisted AppLayout preference without duplicating state.
- [ ] Admin/maintenance settings remain separate from the user-facing rewrite.

## Supabase Note
Yes, a Supabase config/migration prerequisite may be needed before implementation if the profile table, columns, or RLS policies required by settings are not already present.