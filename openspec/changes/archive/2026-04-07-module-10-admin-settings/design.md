# Design: Module 10 - Admin / Settings

## Technical Approach
Introduce a `settings` table in Supabase and use Supabase Auth user metadata (`role: 'admin'`) to identify administrators. Create a feature-sliced domain (`src/features/settings`) containing the UI and an `AdminRoute` wrapper. A local `settings-repository` will handle data fetching and mutation using `TanStack Query` for state management.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Settings Storage | Supabase `settings` table with JSONB or typed columns | LocalStorage only, separate microservice | Centralizes configuration for all clients. Secure and auditable. |
| Role Identification | Supabase Auth `user_metadata.role` (or custom claims) | Separate `user_roles` table | Metadata is injected directly into the session JWT, avoiding an extra DB roundtrip on every route change. |
| State Management | `TanStack Query` with a repository class | Redux, Context API, direct `useEffect` | Aligns with the existing `HistoryFeature` pattern. Handles caching, retries, and mutations cleanly. |

## Data Flow

```text
[ Admin UI Form ] ──(submit)──> [ useUpdateSettings (Mutation) ]
                                      │
                                      ▼
[ Supabase Auth Check ] <── [ settings-repository ]
     (jwt 'role')                     │
                                      ▼
                             [ Supabase 'settings' Table ]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/*_create_settings.sql` | Create | DDL for `settings` table and RLS policies (only admins can read/write). |
| `src/features/auth/AuthProvider.tsx` | Modify | Expose `isAdmin` from the session context. |
| `src/features/auth/AdminRoute.tsx` | Create | Route wrapper that redirects standard users. |
| `src/lib/repositories/settings-repository.ts` | Create | Database interactions and Zod payload validation. |
| `src/features/settings/SettingsFeature.tsx` | Create | Main view component. |
| `src/features/settings/hooks/useSettings.ts` | Create | Query/mutation hooks wrapper. |
| `src/App.tsx` | Modify | Mount `/app/admin/settings` wrapped in `AdminRoute`. |

## Interfaces / Contracts

```typescript
import { z } from "zod";

export const AppSettingsSchema = z.object({
  id: z.string().uuid(),
  maintenance_mode: z.boolean().default(false),
  allowed_domains: z.array(z.string()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `settings-repository.ts` | Mock Supabase client, verify Zod validation throws on bad payloads. |
| Unit | `AuthProvider` & `AdminRoute` | Verify `isAdmin` is calculated correctly; verify `AdminRoute` redirects if `isAdmin` is false. |
| Integration | `SettingsFeature` | Render with mocked QueryClient, verify form submission triggers the mutation hook. |

## Migration / Rollout
- A Supabase migration script must be applied to create the `settings` table and RLS policies.
- An initial admin user must be bootstrapped manually or via a secure seed script by updating the user metadata in Supabase Auth.

## Open Questions
- [ ] Will we use a strict columns approach for the `settings` table (e.g. boolean `maintenance_mode`) or a single JSONB column for flexibility? -> Defaulting to strict columns mapped to Zod for safety.
- [ ] Should the route be `/app/admin/settings` or just `/admin` at the root? -> `/app/admin/settings` keeps it inside the protected app shell.