# Design: Module 14 - Settings Rewrite

## Technical Approach
Rebuild the settings page as a user-facing account screen while keeping the page shell in `src/pages/SettingsPage.tsx`. The page should compose three sections: `Account Information`, `Linked Accounts`, and `Danger Zone`. UI state stays local to the feature; persistence and validation stay in dedicated hooks/repositories.

The current admin-style `SettingsFeature` and `SettingsForm` should be replaced or reshaped into a profile-oriented feature that reads the authenticated user from `AuthProvider`, profile data from Supabase `profiles`, and theme state from the shared shell. The theme control must reflect the AppLayout preference and dispatch changes through the shell’s existing storage path, not a second settings-owned store.

## Architecture Decisions

### Decision: Split settings into page shell + feature sections
**Choice**: Keep the route-level page as composition only, and move account/profile controls into feature components under `src/features/settings/`.
**Alternatives considered**: Put all logic directly in `src/pages/SettingsPage.tsx`; create a new route-level container for everything.
**Rationale**: The repo already uses feature-based domain isolation. This keeps the page thin, lets each section test independently, and avoids reintroducing admin-style monolith behavior.

### Decision: Use Supabase `profiles` as the source of truth for editable user data
**Choice**: Load and save profile fields through a small profile repository or service that targets `public.profiles`.
**Alternatives considered**: Reuse the current admin `settings` repository; store profile edits in local state only.
**Rationale**: `public.profiles` already exists with owner RLS and a user-triggered creation flow. Reusing the admin settings repo would mix unrelated concerns and reintroduce the maintenance schema.

### Decision: Treat theme as derived shell state
**Choice**: Render the current theme in settings and route changes through the same theme setter used by `AppLayout`.
**Alternatives considered**: Duplicate theme persistence inside settings; read localStorage directly from the page.
**Rationale**: The shell already owns `nexus-talent:theme:v1`. A second source of truth would drift and create inconsistent UI state.

### Decision: Keep export client-scoped and synchronous at the UI boundary
**Choice**: Build export payloads in the feature layer from current user/profile data and trigger download/copy behavior from the page.
**Alternatives considered**: Add a server endpoint just for export; expose export from the persistence layer.
**Rationale**: The export is a user action, not a persistence concern. Keeping it client-side avoids unnecessary backend work and keeps the scope minimal.

## Data Flow
`AuthProvider` supplies `session/user` -> settings feature derives owner identity and connected providers -> profile repository loads `public.profiles` -> form edits update local draft -> validation runs via Zod -> save mutates Supabase profile row -> query cache refreshes -> UI re-renders.

Theme flow is separate: `AppLayout` owns persistence and DOM theme updates -> settings reads the active mode through a shared theme hook/context or prop bridge -> toggles call the same shell setter.

```
Auth context ──→ Settings page ──→ Profile hook/repository ──→ Supabase profiles
      │                  │                    │
      │                  └──→ Theme bridge ───┴──→ AppLayout storage
      └──→ Linked provider status from session.identities / metadata
```

## File Changes
| File | Action | Description |
|------|--------|-------------|
| `src/pages/SettingsPage.tsx` | Modify | Replace admin copy and compose the new user-facing sections. |
| `src/features/settings/SettingsFeature.tsx` | Modify | Orchestrate account/profile, linked accounts, theme, export, and danger zone sections. |
| `src/features/settings/components/*` | Modify/Create | Split the current form into section-level presentational components. |
| `src/features/settings/hooks/*` | Modify/Create | Add profile/theme/export hooks and keep data access separate from UI. |
| `src/lib/repositories/*` | Modify/Create | Add a profile repository if the feature needs explicit Supabase profile reads/writes. |
| `src/lib/supabase/client.ts` or a new supabase helper | Optional | Only if a small helper is needed to read user/session/provider metadata cleanly. |
| `supabase/migrations/*` | None expected | Existing `public.profiles` + RLS already satisfy the base profile dependency. |

## Interfaces / Contracts
```ts
type SettingsSectionState = {
  profile: { email: string; displayName: string | null; loading: boolean; error: string | null };
  theme: { mode: "dark" | "light"; setMode(next: "dark" | "light"): void };
  linkedAccounts: Array<{ provider: "github" | "google" | "linkedin"; connected: boolean }>;
};
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Profile mapping, theme derivation, linked-account detection, export payload shape | Vitest for repository/helpers and Zod validation. |
| Integration | Settings page loading, save flow, unavailable profile state, theme toggle sync | React Testing Library with mocked auth/query clients and a stubbed profile repository. |
| E2E | User can open settings, edit profile, see linked status, trigger export, confirm delete | Use existing app route coverage if E2E is available; otherwise keep this as a manual verification gap. |

## Migration / Rollout
No migration required for the base design. `public.profiles` and its RLS policies already exist. If the page needs extra profile columns beyond `email` and `display_name`, add a minimal follow-up migration before implementation.

## Open Questions
None.