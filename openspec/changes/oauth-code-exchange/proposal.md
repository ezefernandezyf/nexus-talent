# Proposal: OAuth One-Time Code Exchange

## Intent

Replace JWT-in-URL in the OAuth 302 redirect with a one-time random code exchange. The JWT appears in access logs and browser traces as a query parameter. A 64-hex-char code carries no claims, expires in 60s, and is useless without the exchange endpoint.

## Scope

### In Scope

- `POST /api/auth/exchange` on Render, protected by `X-Exchange-Secret` header
- In-memory code store (`Map`) with 60s TTL, periodic 30s cleanup, single-use enforcement
- Modified OAuth callback: generate code → store → redirect `?code=<CODE>&redirect=<path>`
- Modified Edge Function: extract code → `POST` exchange → set cookie → redirect
- Exchange failure: redirect to `/auth/sign-in?error=exchange_failed`

### Out of Scope

- JWT generation, validation, cookie format, middleware, frontend changes, persistent storage

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: OAuth callback redirect changes from `?token=<JWT>` to `?code=<CODE>`. New `POST /exchange` for server-to-server JWT retrieval via shared secret.

## Approach

Reuse the `Map` + `setInterval` pattern from `rate-limiter.ts`. New file `code-store.ts`.

Render callback generates code, stores `{ jwt, expiresAt }`, redirects to Vercel `?code=`. Edge Function `POST`s `{ code }` + `X-Exchange-Secret` to `/api/auth/exchange`. Render looks up code → returns `{ token }` → deletes entry → Edge Function sets cookie + 302. On miss/expired → 404 → redirect to sign-in with error.

`EXCHANGE_SECRET` env var on both platforms. Missing/mismatched → 401.

## Affected Areas

| Area | Impact | Files |
|------|--------|-------|
| `server/src/auth/` | Modified + New | `auth.controller.ts`, `auth.router.ts`, `oauth.service.ts`, `code-store.ts` (new) |
| `api/auth/` | Modified | `session.ts` |
| `web/` | None | - |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Render cold-start adds 2–5s latency | Med | Map lookup O(1); JWT already computed. |
| Race condition on code consumption | Low | First exchange deletes code; second gets 404. |
| `EXCHANGE_SECRET` misconfigured | Low | 401 → redirect to sign-in. |
| Edge Function unreachable | Low | User retries OAuth; no data loss. |

## Rollback Plan

1. Revert `session.ts` to read `?token=` from URL
2. Revert controller callback to pass `?token=`
3. Remove `/exchange` route, delete `code-store.ts`
4. Drop `EXCHANGE_SECRET` env var

Revert: 3 files + 1 deletion. No DB migration.

## Dependencies

- `EXCHANGE_SECRET` env var (must match on Render and Vercel)
- `crypto.randomBytes` - built-in, already used in `oauth.service.ts`

## Success Criteria

- [ ] No JWT in any OAuth redirect URL query parameter
- [ ] Code is single-use: second exchange returns 404
- [ ] Expired codes cleaned by periodic sweep
- [ ] Exchange rejects requests without valid `X-Exchange-Secret` (401)
- [ ] Exchange failure → `/auth/sign-in?error=exchange_failed`
- [ ] Full OAuth flow works end-to-end
