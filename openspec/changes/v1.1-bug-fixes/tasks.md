# Tasks: V1.1 Bug Fixes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~65 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR — all 6 bugs fit one review |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Trivial Frontend Fixes

- [x] 1.1 Move `@import url("…Material+Symbols…")` from line 82 to line 1 in `web/src/index.css` so it precedes all `@font-face` blocks. (Bug 2)
- [x] 1.2 Remove `<p>{copy.kicker}</p>` (line 75) and the subtitle+divider block (lines 91–98) from `web/src/features/auth/components/AuthShell.tsx`. Optionally strip unused `kicker`/`subtitle` keys from `AUTH_SHELL_COPY`. (Bug 5)
- [x] 1.3 Replace every U+2014 em-dash with U+002D hyphen in all `web/src/**/*.ts` and `web/src/**/*.tsx` files. Use `sed` or a script; skip `.md` files. Verify zero U+2014 remain with `rg '—' --glob '*.ts' --glob '*.tsx'`. (Bug 4)

## Phase 2: Ops / Config

- [/] 2.1 Add `GROQ_API_KEY` environment variable in Render dashboard (applies to `nexus-talent` service) with a valid Groq API key. No code change. (Bug 3a) — TODO added in `analysis.service.ts`

## Phase 3: Core Logic Fixes

- [x] 3.1 In `web/src/core/api-client.ts`, extend the 401 `isAuthPage` guard to also exclude `/` and `/privacy`. Paths `/`, `/privacy`, and `/auth/*` must NOT trigger redirect. (Bug 6)
- [x] 3.2 In `web/src/features/auth/AuthProvider.tsx` line 97, change OAuth redirect from `window.location.href = \`/api/auth/oauth/${provider}\`` to a direct Render backend URL constant (e.g., `RENDER_BACKEND_URL + "/api/auth/oauth/" + provider`). Document the constant. (Bug 1)
- [x] 3.3 In `web/src/core/error-mapper.ts`, insert a discriminator BEFORE line 29: check `err.status` within HTTP ranges — 401/403 → `auth_error`, 502/503 → `api_error`, 5xx → `api_error`. Only fall through to `db_error` when `.name === 'PostgrestError'`. (Bug 3b)

## Phase 4: Verification

- [x] 4.1 Run `pnpm run lint && pnpm test` — all existing tests pass. (222 tests, all pass)
- [ ] 4.2 Bug 1: trigger OAuth sign-in → browser redirects to Render URL directly. (MANUAL VERIFY)
- [ ] 4.3 Bug 2: load app → Material Symbols render as icons, not fallback text. (MANUAL VERIFY)
- [ ] 4.4 Bug 3: call `POST /api/ai/analyze` → 200 response; error toast shows "API error" on 502. (MANUAL VERIFY)
- [x] 4.5 Bug 4: em-dash check returns zero results. ✓
- [ ] 4.6 Bug 5: navigate to `/auth/sign-in` and `/auth/sign-up` → only title visible, no kicker/subtitle. (MANUAL VERIFY)
- [ ] 4.7 Bug 6: visit `/` and `/privacy` with expired cookie → page loads without redirect to sign-in. (MANUAL VERIFY)
