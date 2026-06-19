# Proposal: P5 — Frontend Refactor

## Intent

Replace Supabase SDK with backend HTTP APIs for auth, analysis, and history. Remove dead admin code. Settings/profile remain on Supabase until V1.2.1.

## Scope

### In Scope
- **A**: Zustand auth store + AuthProvider (GET /api/auth/me)
- **B**: Centralized Axios client + swap analysis hooks to HTTP
- **C**: Remove AdminRoute, isAdmin, role dead code
- **D**: History list → backend paginated
- **F**: Remove `@supabase/supabase-js` after A-D

### Out of Scope
- Settings/profile repos → kept on Supabase until V1.2.1
- Identity linking/unlinking (removed — backend doesn't support)
- React Router v7 upgrade
- AI client (already migrated to POST /api/ai/analyze)

## Capabilities

### New Capabilities
- `auth`: Backend-driven session management (Zustand store + AuthProvider)
- `api-client`: Centralized Axios instance with `withCredentials: true`

### Modified Capabilities
- `persistence`: Repository injection defaults → HTTP for all hooks
- `admin`: Remove role/isAdmin/AdminRoute requirements (dead code)
- `history`: Remove localStorage fallback for authenticated users

## Approach

Per-slice execution, all targeting `develop`:

| Slice | What | Status |
|-------|------|--------|
| A | `auth-store.ts` (Zustand), rewrite AuthProvider→GET /api/auth/me, update guards + forms + OAuth callback | New |
| B | `api-client.ts` (Axios, withCredentials:true, 401 interceptor), swap 5 hook defaults to HTTP | New |
| C | Delete AdminRoute, remove role from auth context, drop isAdmin | Cleanup |
| D | History pagination via GET /api/analyses (cursor/offset) | New |
| F | Delete `web/src/lib/supabase/`, remove deps + env vars, update 12+ test mocks | Cleanup |

Option (a) chosen for settings/profile: keep Supabase fallback until V1.2.1 endpoints exist. No backend endpoint expansion.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/features/auth/` | Modified | AuthProvider, guards, forms, callback |
| `web/src/core/api-client.ts` | New | Axios instance |
| `web/src/auth/auth-store.ts` | New | Zustand session store |
| `web/src/lib/repositories/` | Modified | Hook defaults → HTTP |
| `web/src/lib/supabase/` | Removed | Entire directory |
| `web/src/features/admin/` | Removed | AdminRoute |
| 12+ test files | Modified | Supabase → Axios mocks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OAuth callback hash vs query params | High | AuthCallbackPage handles backend redirect |
| 12+ test files need mock refactoring | High | Slice-by-slice, no big bang |
| Settings/profile break if Supabase removed too early | Med | Keep Supabase for those until V1.2.1 |

## Rollback Plan

Per-slice revert commits. Full rollback: `git revert` on each slice in reverse order. Supabase deps remain in package.json until Slice F passes.

## Dependencies

- Backend auth endpoints (P2) — ✅ complete
- Backend history endpoints (P4) — ✅ complete
- Settings/profile endpoints — N/A (deferred to V1.2.1)

## Success Criteria

- [ ] Login/register/logout work end-to-end without Supabase
- [ ] GET /api/auth/me hydrates session on mount
- [ ] All HTTP calls use Axios with `withCredentials: true`
- [ ] History list/delete/update hit backend APIs (no localStorage)
- [ ] No role checks, AdminRoute, or `isAdmin` code exists
- [ ] `@supabase/supabase-js` removable from package.json
- [ ] Existing test suite passes with updated mocks
