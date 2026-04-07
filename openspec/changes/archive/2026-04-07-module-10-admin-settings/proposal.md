# Proposal: Module 10 - Admin / Settings

## Intent
Implement a secure, Supabase-backed settings and administration layer to allow runtime configuration of the application. This provides a foundation for RBAC and eliminates hardcoded environment dependencies where possible.

## Scope

### In Scope
- Supabase `settings` table creation and initial seed data.
- User metadata or roles column to identify `admin` users.
- `settings-repository` to interface with Supabase (with a local fallback if disconnected).
- Protected `/app/admin/settings` route (accessible only by admins).
- Simple UI (Zod-validated form) to view and edit settings.
- E2E/integration tests for the settings flow and admin route protection.

### Out of Scope
- Granular per-feature RBAC (only a binary admin/user check).
- Multi-tenant organization settings.
- Billing, consumption metrics, or API token generation.
- Full migration of existing local history to Supabase (deferred to a dedicated history migration module).

## Approach
We will adopt the "Recommended" approach from the exploration:
1. **DB Tier**: Create a migration for a `settings` table (JSONB or strict columns) and update the Auth schema for an `admin` flag.
2. **Logic Tier**: Create a `settings-repository.ts` that reads/writes to Supabase, validating payloads with Zod.
3. **UI Tier**: Add an `<AdminRoute />` component securing `/app/admin/*`. Build a `SettingsFeature` with a form to manage values.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/supabase/*` | Modified | Add migrations/types for settings. |
| `src/features/auth/*` | Modified | Add role/admin exposure in hook, and add `<AdminRoute />`. |
| `src/App.tsx` | Modified | Mount new `/app/admin/settings` route. |
| `src/lib/repositories/settings-repository.ts` | New | Repository for fetching/mutating settings. |
| `src/features/settings/*` | New | UI feature slice for settings management. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing Supabase Env Variables | High | Implement a graceful local-only fallback for settings. |
| Admin lock-out | Low | Provide a CLI/SQL script to bootstrap the first admin user. |
| Zod schema mismatches with DB | Medium | Ensure strict typing and generate Supabase types if possible. |

## Rollback Plan
- Revert the route additions in `src/App.tsx`.
- Drop the `settings` table from Supabase via a down-migration.
- Delete the `src/features/settings/` and `src/lib/repositories/settings-repository.ts` files.

## Dependencies
- Supabase project configured and accessible via VITE variables.
- Zod for runtime schema validation.

## Success Criteria
- [ ] Users without the admin role cannot access `/app/admin/settings`.
- [ ] Admin users can view current application settings.
- [ ] Admin users can successfully update settings, and changes persist in Supabase.
- [ ] Settings payloads are strictly validated by Zod before transmission.
- [ ] Tests verify route protection and repository logic.