# Server Lint Fix Specification

## Purpose
Fix 4 type errors in `server/src/history/history.service.ts` blocking CI. Errors involve `as object` casts that must become `JsonValue` for Prisma 7 compatibility.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| SLT-01 | Replace all `as object` casts with `as JsonValue` in `history.service.ts` | P0 | MUST |
| SLT-02 | Ensure `JsonValue` is imported from `@prisma/client/runtime/library` | P0 | MUST |
| SLT-03 | `pnpm --filter @nexus-talent/server typecheck` MUST pass with zero errors | P0 | MUST |
| SLT-04 | Existing history service behavior MUST remain unchanged | P0 | MUST |

### Scenario: Type check passes after fix
- GIVEN 4 type errors in `server/src/history/history.service.ts`
- WHEN all `as object` casts are replaced with `as JsonValue`
- WHEN `pnpm --filter @nexus-talent/server typecheck` runs
- THEN zero type errors are reported
- AND all existing history service tests pass

### Scenario: History creation still works after fix
- GIVEN the type cast fix is applied
- WHEN `history.service.create()` is called with valid data
- THEN the database write succeeds
- AND the returned object matches the expected schema
