# Design: Module 25 - Settings & Account Access Hardening

## Technical Approach

Convert the personal settings surface from admin-only to authenticated-user access, keep the existing settings UI, and align every shell entry point to the same route contract. The shell will expose Settings only for authenticated users, route access will move to `/app/settings`, and the danger-zone deletion control will be wired through the settings flow instead of remaining visual-only.

## Architecture Decisions

### Decision: Auth-only settings route

**Choice**: Replace the admin gate for personal settings with an authentication gate and mount the page at `/app/settings`.
**Alternatives considered**: Keep `/app/admin/settings`; add a second user settings route.
**Rationale**: Settings are user-owned data, not admin-owned data. A single auth-only route reduces confusion and avoids mixing personal settings with admin concerns.

### Decision: Filter settings in shell navigation

**Choice**: Show Settings only to authenticated users in the app shell and mobile drawer.
**Alternatives considered**: Keep the link visible and rely on route redirects.
**Rationale**: Navigation should not advertise destinations that the current session cannot use. Filtering at the shell matches the existing auth-aware UI pattern.

### Decision: Keep settings feature surface intact

**Choice**: Reuse the current `SettingsFeature` sections and adjust only the access contract plus the danger-zone action flow.
**Alternatives considered**: Rewrite settings into a new page or split into separate features.
**Rationale**: The current feature already covers theme, export, profile, and linked accounts. The change is access and ownership, not product redesign.

## Data Flow

`useAuth()` -> route guard -> `SettingsPage` -> `SettingsFeature` -> `useSettings()` -> profile repository / auth session

`AppLayout` -> auth status -> filtered nav items -> desktop account menu / mobile drawer

Settings delete flow:

`SettingsFeature` -> confirmation state -> delete action in settings hook/service -> auth/session invalidation -> redirect or signed-out state

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/router/AppRouter.tsx` | Modify | Move settings route out of `/app/admin` and protect it with auth-only access |
| `src/features/auth/components/AdminRoute.tsx` | Modify or repurpose | Replace admin-only semantics with an auth-only protected route or add a dedicated protected route |
| `src/layouts/AppLayout.tsx` | Modify | Filter Settings visibility by auth status and point shell links to `/app/settings` |
| `src/features/settings/SettingsFeature.tsx` | Modify | Wire the danger-zone confirmation to a real delete flow |
| `src/features/settings/hooks/useSettings.ts` | Modify | Add the account deletion operation and surface pending/error state |
| `src/pages/SettingsPage.tsx` | Modify | Keep page wiring aligned with the new route |
| `src/layouts/AppLayout.test.tsx` | Modify | Cover authenticated/unauthenticated nav visibility and account menu behavior |
| `src/pages/SettingsPage.test.tsx` | Modify | Cover route access and delete confirmation flow |

## Interfaces / Contracts

```ts
type DeleteAccountResult = {
  success: boolean;
};
```

The settings hook SHOULD expose a delete operation with pending and error state so the feature can render confirmation and failure feedback without embedding repository logic in the UI.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Nav filtering and route guard behavior | Render tests for authenticated/public sessions |
| Unit | Settings deletion state | Hook and feature tests for confirmation, pending, error, and success |
| Integration | Route access and shell entry points | App router and layout tests for `/app/settings` and menu links |
| E2E | Full account path | Manual or future browser flow for settings access and logout |

## Migration / Rollout

No migration required. The change is limited to routing, navigation, and account-action wiring.

## Open Questions

- [ ] Should the old `/app/admin/settings` path redirect permanently to `/app/settings`, or remain as a compatibility alias?
- [ ] Should account deletion sign the user out immediately after success, or defer that behavior to the auth layer?