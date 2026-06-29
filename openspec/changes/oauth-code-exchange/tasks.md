# Tasks: OAuth One-Time Code Exchange

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~290 (4 new/modified files + ~150 test lines) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Foundation — Code Store

- [x] 1.1 Create `server/src/auth/code-store.ts` — `Map<string, { jwt, expiresAt }>`, 60s TTL, `set(code, jwt)`, `get(code)` with single-use deletion, `startCleanup()` via `setInterval(30s)` with `.unref()`, `stopCleanup()` for tests
- [x] 1.2 Write unit tests for `code-store.ts` — store → retrieve → re-retrieve null (single-use); expire entry → get returns null; cleanup sweep purges expired entries

## Phase 2: Exchange Endpoint

- [x] 2.1 Modify `server/src/auth/auth.router.ts` — add `POST /api/auth/exchange` route pointing to `exchangeCode` controller method
- [x] 2.2 Add `exchangeCode()` to `server/src/auth/auth.controller.ts` — verify `X-Exchange-Secret` header matches `EXCHANGE_SECRET` env var (401 on mismatch), read `{ code }` from body, call `codeStore.get(code)`, return `200 { token }` or `404 { error: "Code not found or expired" }`
- [x] 2.3 Write controller tests for exchange — mock store: valid code returns 200 + token; missing/wrong secret returns 401; expired/unknown code returns 404; single-use (second call returns 404)

## Phase 3: Modify OAuth Callback

- [x] 3.1 Modify `googleCallback()` in `server/src/auth/auth.controller.ts` — after JWT sign, generate 64-hex code via `crypto.randomBytes(32).toString("hex")`, store `{ jwt, expiresAt: Date.now() + 60000 }` in codeStore, redirect to `{CLIENT_URL}/api/auth/session?code=<CODE>&redirect=<target>` instead of `?token=<JWT>`
- [x] 3.2 Verify callback no longer passes JWT in any query parameter

## Phase 4: Edge Function — Exchange Code for Cookie

- [x] 4.1 Modify `api/auth/session.ts` — read `?code=` instead of `?token=`, `POST { code }` to `{RENDER_URL}/api/auth/exchange` with `X-Exchange-Secret` header, on success set `nexus-talent-session` cookie (HttpOnly; Secure; SameSite=Lax; Domain=.nexustalent.vercel.app; Path=/; Max-Age=604800) + redirect to target path
- [x] 4.2 Handle errors — exchange failure or non-200: redirect to `/auth/sign-in?error=exchange_failed`; missing `?code=`: redirect to `/auth/sign-in`

## Phase 5: Environment & Verification

- [x] 5.1 Add `EXCHANGE_SECRET` env var documentation
- [x] 5.2 End-to-end test — complete OAuth flow: sign-in → Google consent → callback redirects with `?code=` → Edge Function exchanges → cookie set → user lands on target page; verify JWT never appears in URL
- [x] 5.3 Test error path — invalid/expired code → redirect to `/auth/sign-in?error=exchange_failed`
- [x] 5.4 Remove old `?token=` reading path from Edge Function if dead code remains
