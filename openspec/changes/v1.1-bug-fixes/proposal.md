# Proposal: V1.1 Bug Fixes

## Intent

Fix 6 production bugs discovered post V1.1 backend migration. All are small-scope regressions or misconfigurations - zero architectural changes. Each bug blocks a specific user flow; together they degrade trust in the auth, AI, and landing experience.

## Scope

### In Scope
- **Bug 1** - Google OAuth direct redirect (cookie domain mismatch)
- **Bug 2** - Material Icons CSS `@import` ordering
- **Bug 3** - AI Analyze 502: `GROQ_API_KEY` on Render + frontend error mapper
- **Bug 4** - Em-dashes (U+2014) → hyphens in `.ts`/`.tsx` files
- **Bug 5** - Remove kicker/subtitle from `AuthShell.tsx`
- **Bug 6** - 401 interceptor exclude `/` and `/privacy`

### Out of Scope
- Em-dash replacement in `.md` docs/specs
- Auth page copy redesign (text removal only, no new copy)
- New public pages beyond `/privacy` excluded from 401

## Capabilities

### Modified Capabilities
- **api-client**: 401 interceptor SHALL exclude `/` and `/privacy` from auto-redirect
- **observability-errors**: error mapper SHALL distinguish HTTP error codes (502 ≠ `db_error`)

### New Capabilities
- None

## Approach

| Bug | Root Cause | Fix | Files |
|-----|-----------|-----|-------|
| 1. OAuth 403 | State cookie set on vercel.app, Google callbacks to onrender.com | Redirect to Render directly | `AuthProvider.tsx` (line 97) |
| 2. Icons broken | `@import` after `@font-face` violates CSS spec | Move `@import` to top | `web/src/index.css` |
| 3a. AI 502 | `GROQ_API_KEY` missing in Render env vars | Add key to Render dashboard | No code - ops only |
| 3b. AI 502 | Error mapper labels all HTTP errors as `db_error` | Add HTTP status discriminator | `web/src/core/error-mapper.ts` |
| 4. Em-dashes | U+2014 in ~50 `.ts`/`.tsx` files | Automated find-replace | 50 `.ts`/`.tsx` files |
| 5. Auth text | Kicker/subtitle strings visible in auth pages | Remove 3 lines copy + 1 JSX line | `AuthShell.tsx` |
| 6. Landing redirect | 401 interceptor fires on `/` and `/privacy` | Add path exclusions | `web/src/core/api-client.ts` |

**Estimated changed lines**: ~65 (additions + deletions). Well under 400-line review budget.

Dependencies: none - all 6 bugs are independent.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OAuth redirect hardcodes Render URL - breaks if backend URL changes | Low | Single constant, documented in code |
| 401 exclusion list grows - regex maintenance burden | Low | Only 2 paths added; future additions opt-in |
| Em-dash replacement breaks a string literal assertion | Low | Replace only in visible strings; review diff before commit |

## Rollback Plan

Each fix is atomic and revertible independently. Revert any single commit via `git revert` - no cascading effects between bugs.

## Dependencies

- Render dashboard access for `GROQ_API_KEY` env var (Bug 3a)
- None for code-level fixes

## Success Criteria

- [ ] Google OAuth sign-in works end-to-end in production
- [ ] Material Icons render on all pages
- [ ] `POST /api/ai/analyze` returns 200 with valid `GROQ_API_KEY`
- [ ] Error mapper returns distinct labels for `auth_error`, `api_502`, `db_error`
- [ ] Zero U+2014 em-dashes in `.ts`/`.tsx` files
- [ ] Auth page shows title only - no kicker or subtitle
- [ ] Landing page `/` and `/privacy` load without redirecting to `/auth/sign-in`
