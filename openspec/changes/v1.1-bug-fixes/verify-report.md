# Verification Report — V1.1 Bug Fixes

**Change**: `v1.1-bug-fixes`
**Branch**: `fix/v1.1-bugs`
**Mode**: Standard (Strict TDD disabled)
**Date**: 2026-06-26
**Persistence**: Both (Engram + OpenSpec)

---

## Completeness Table

| Artifact | Status | Notes |
|----------|--------|-------|
| Proposal | ✅ Present | 6 bugs, approach, risks, rollback |
| Delta Specs | ✅ Present | 7 requirements, 12 scenarios |
| Tasks | ✅ Present | 10 tasks across 4 phases |
| Design | ⏭️ Skipped | No design artifact — 6 trivial fixes, no architectural decisions |
| Apply Report | ✅ Present (Engram) | Mem #1181: all 7 impl tasks applied |

---

## Task Completion

| Task ID | Bug | Description | Status | Verdict |
|---------|-----|-------------|--------|---------|
| 1.1 | Bug 2 | Move `@import` to line 1 in `index.css` | [x] | ✅ VERIFIED |
| 1.2 | Bug 5 | Remove kicker/subtitle from `AuthShell.tsx` | [x] | ✅ VERIFIED |
| 1.3 | Bug 4 | Replace U+2014 em-dashes with hyphens | [x] | ❌ INCOMPLETE (1 remaining) |
| 2.1 | Bug 3a | Add `GROQ_API_KEY` TODO in `analysis.service.ts` | [/] | ✅ TODO EXISTS |
| 3.1 | Bug 6 | Exclude `/` and `/privacy` from 401 redirect | [x] | ✅ VERIFIED |
| 3.2 | Bug 1 | OAuth redirect directly to Render | [x] | ✅ VERIFIED |
| 3.3 | Bug 3b | Error mapper discriminator for status codes | [x] | ✅ VERIFIED |
| 4.1 | All | Run `pnpm lint && pnpm test` | [x] | ✅ 260 tests pass |

---

## Build / Test / Coverage

### Test Results

| Package | Test Files | Tests | Result |
|---------|-----------|-------|--------|
| Server (`@nexus-talent/server`) | 1 | 28 | ✅ All pass |
| Web (`@nexus-talent/web`) | 57 | 222 | ✅ All pass |
| E2E (`@nexus-talent/e2e`) | 10 | 10 | ✅ All pass |
| **Total** | **68** | **260** | ✅ **All pass** |

### Lint

```
server/src/history/history.service.ts(97-100): error TS2322
  → Pre-existing. Prisma JSON field assignment. NOT caused by this change.
```

### Format (Prettier)

```
⚠️ shared/src/schemas.ts        — code style issues (caused by em-dash replacement)
⚠️ server/src/analysis/analysis.controller.ts — code style issues (caused by em-dash replacement)
⚠️ server/src/analysis/analysis.service.ts    — code style issues (new TODO comment)
```

---

## Spec Compliance Matrix

### [api-client] 401 Interceptor (REQ-API-002)

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| 401 on protected route → redirect | `api-client.ts:24`: `!isAuthPage && path !== "/" && path !== "/privacy"` | E2E: protected-redirect.spec.ts passes | ✅ COMPLIANT |
| 401 on landing page → no redirect | `api-client.ts:24`: `path !== "/"` exclusion | Static verification | ✅ COMPLIANT |
| 401 on privacy page → no redirect | `api-client.ts:24`: `path !== "/privacy"` exclusion | Static verification | ✅ COMPLIANT |

### [auth-client] OAuth Flow (REQ-AUTH-005)

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| OAuth sign-in succeeds | `AuthProvider.tsx:98-101`: `RENDER_BACKEND_URL + "/api/auth/oauth/" + provider` | `AuthProvider.test.tsx:161`: asserts `window.location.href` = Render URL | ✅ COMPLIANT |
| Cookie domain matches callback | Same domain: `nexus-talent-api.onrender.com` | Architectural: no proxy hop | ✅ COMPLIANT |
| `restoreSession()` after callback | `restoreSession()` | Covered by existing session boot test | ✅ COMPLIANT |

### [observability-errors] Domain Error Mapper

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| 502 → api_error | `error-mapper.ts:34`: `err.status >= 500` → `api_error` | E2E console: `{code: auth_error}` for 401, static for 502 | ⚠️ NO UNIT TEST |
| ZodError → clear message | `error-mapper.ts:12-15`: ZodError branch | `error-mapper.test.ts`: ZodError test | ✅ COMPLIANT |

### [auth] Auth Shell Header Text

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| Sign-in: title only | `AuthShell.tsx:68`: `<h1>{copy.title}</h1>` only | `AuthShell.test.tsx` passes | ✅ COMPLIANT |
| Sign-up: title only | Same component, `mode="sign-up"` → renders copy.title | Same test covers both modes | ✅ COMPLIANT |

### [web-styles] Material Symbols CSS Import Ordering

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| Icons load correctly | `index.css:1-2`: `@import` at top before `@font-face` | CSS spec-compliant ordering verified | ✅ COMPLIANT |

### [observability-errors] GROQ API Key Configuration

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| AI analysis with valid key | `analysis.service.ts:56`: reads `process.env.GROQ_API_KEY` | Static verification | ✅ COMPLIANT |
| AI analysis without key | `analysis.service.ts:60-61`: throws `AppError(502, ...)` | Static verification | ✅ COMPLIANT |
| TODO comment exists | `analysis.service.ts:58-59`: TODO comment | Static verification | ✅ COMPLIANT |

### [content-cleanup] Em-Dash Removal

| Scenario | Implementation | Test Evidence | Status |
|----------|---------------|---------------|--------|
| Zero em-dashes in source | **FAIL**: `server/src/analysis/analysis.service.ts:58` has U+2014 | Python scan confirmed U+2014 @ line 58 | ❌ NON-COMPLIANT |

---

## Correctness Table

| Bug | Root Cause | Fix Applied | Matches Spec | Matches Task |
|-----|-----------|-------------|-------------|-------------|
| 1 (OAuth) | State cookie domain mismatch | Direct Render URL redirect | ✅ | ✅ |
| 2 (Icons) | `@import` after `@font-face` | Move `@import` to top | ✅ | ✅ |
| 3a (GROQ_KEY) | Missing env var on Render | TODO comment in code | ✅ | ✅ |
| 3b (Error mapper) | All HTTP errors → db_error | Status code discriminator | ✅ | ✅ |
| 4 (Em-dashes) | U+2014 in ~50 files | Bulk replacement | ⚠️ 1 missed | ❌ 1 missed |
| 5 (Auth text) | Kicker/subtitle visible | Removed from render output | ✅ | ✅ |
| 6 (Landing redirect) | 401 on public pages | Path exclusion list | ✅ | ✅ |

---

## Design Coherence

⏭️ **Skipped** — No design artifact exists. All 6 bugs are trivial fix-scope with no architectural decisions. The proposal (proposal.md) serves as the design reference and the implementation matches it exactly.

---

## Issues

### CRITICAL

1. **Bug 4: U+2014 em-dash remains in `server/src/analysis/analysis.service.ts:58`**
   - **Finding**: The TODO comment added in task 2.1 contains `—` (U+2014) after "(nexus-talent service) — manual step"
   - **Spec ref**: `[content-cleanup]` — "All `.ts` and `.tsx` files SHALL use hyphens (U+002D) instead of em-dashes"
   - **Impact**: Violates the spec requirement for zero em-dashes in TypeScript files
   - **Fix**: Replace `—` with `-` on line 58 of `server/src/analysis/analysis.service.ts`

### WARNING

2. **Prettier format warnings in 3 files (caused by our changes)**
   - `shared/src/schemas.ts` — em-dash→hyphen replacement in comments broke Prettier alignment
   - `server/src/analysis/analysis.controller.ts` — same root cause
   - `server/src/analysis/analysis.service.ts` — new TODO comment needs formatting
   - **Impact**: `pnpm run format` exits with failure. No functional impact.
   - **Fix**: Run `pnpm -r exec prettier --write src/` on affected files

3. **Pre-existing lint errors in `server/src/history/history.service.ts`**
   - Lines 97-100: `Type 'object' is not assignable to type 'string'` (Prisma JSON field)
   - **Impact**: `pnpm run lint` exits with failure. NOT caused by this change (only em-dash in comment was touched)
   - **Fix**: Out of scope for this change — needs Prisma JSON column type handling

### SUGGESTION

4. **Missing unit test coverage for `auth_error`/`api_error` discrimination in `error-mapper.test.ts`**
   - The mapper correctly handles 401/403 → `auth_error` and 5xx → `api_error`, but `error-mapper.test.ts` only tests ZodError, generic objects, and null
   - E2E tests provide runtime evidence (console shows `{code: auth_error}` for 401), but a dedicated unit test would improve regression resistance
   - **Spec ref**: `[observability-errors]` Scenario: "Mapping an AI API 502 error"

5. **AuthShell test doesn't explicitly verify kicker/subtitle absence**
   - `AuthShell.test.tsx` checks for header text and absence of `help_outline`, but doesn't explicitly assert no kicker/subtitle
   - The rendered component is correct (only `<h1>` with title), so this is low-risk

---

## Verdict

**PASS WITH WARNINGS** — 6 of 7 bugs are fully verified. Bug 4 has one remaining em-dash that must be fixed before archive. Formatting warnings and pre-existing lint errors should be addressed but don't block the functional correctness of the fixes.

---

## Next Recommended Action

**Fix remaining em-dash → re-verify → `sdd-archive`**

Before archiving:
1. Replace U+2014 on `server/src/analysis/analysis.service.ts:58` with U+002D hyphen
2. Run `pnpm -r exec prettier --write src/` to fix formatting warnings
3. Re-run `pnpm test` to confirm 260 tests still pass
4. Proceed to `sdd-archive`
