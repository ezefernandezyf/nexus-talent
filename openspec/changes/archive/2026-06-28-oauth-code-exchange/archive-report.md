# Archive Report: OAuth One-Time Code Exchange

**Archived on**: 2026-06-28
**Change name**: oauth-code-exchange
**Previous path**: `openspec/changes/oauth-code-exchange/`
**Archived to**: `openspec/changes/archive/2026-06-28-oauth-code-exchange/`
**Persistence mode**: hybrid (OpenSpec filesystem + Engram)

## Task Completion Gate

- Total tasks: 13
- Completed tasks: 13 (all `[x]`)
- Unchecked tasks: 0
- **Gate result**: PASS — all tasks complete

## Verification Gate

- Verify verdict: PASS WITH WARNINGS
- CRITICAL issues: None
- Non-critical warnings: 2 (Edge Function runtime coverage, E2E full-flow coverage)
- **Gate result**: PASS — no CRITICAL issues. Warnings documented and acceptable.

## Spec Sync Summary

| Domain | Action | Details |
|--------|--------|---------|
| auth | Updated | Appended 4 new ADDED requirements (One-Time Code Store, OAuth Callback Redirects, Code Exchange Endpoint, Edge Function Exchanges Code for Cookie); documented 1 REMOVED requirement (JWT in OAuth Redirect URL) with Reason and Migration |

### Requirements in merged `openspec/specs/auth/spec.md`:
- 4 existing requirements preserved (Signup Confirm Password, OAuth Buttons Readable, Auth Shell No Placeholder, Social Provider Enablement)
- 4 new requirements appended from delta spec
- 1 removed requirement documented with Reason and Migration

## Archive Contents

```
openspec/changes/archive/2026-06-28-oauth-code-exchange/
├── proposal.md        ✅
├── exploration.md     ✅ (carried forward from exploration phase)
├── specs/
│   └── auth/
│       └── spec.md    ✅ (delta spec, merged into main spec)
├── design.md          ✅
├── tasks.md           ✅ (13/13 tasks complete)
├── verify-report.md   ✅ (PASS WITH WARNINGS)
└── archive-report.md  ✅ (this file)
```

## Engram Observations (IDs for traceability)

| Artifact | Observation ID |
|----------|---------------|
| `sdd/oauth-code-exchange/explore` | #1186 |
| `sdd/oauth-code-exchange/proposal` | #1187 |
| `sdd/oauth-code-exchange/design` | #1188 |
| `sdd/oauth-code-exchange/spec` | #1189 |
| `sdd/oauth-code-exchange/tasks` | #1190 |
| `sdd/oauth-code-exchange/archive-report` | (this observation) |

## Warnings and Notes

1. **Edge Function runtime coverage**: 3 scenarios in the `Edge Function Exchanges Code for Cookie` requirement are source-verified but lack runtime tests because the Edge Function runs exclusively on Vercel's runtime. This was documented in the verify-report as acceptable pre-deployment.
2. **No E2E browser-level full OAuth flow test**: The exchange endpoint is tested via Playwright request-level tests, but a full browser-level OAuth flow is not automated. The verify-report notes this as a suggestion for post-deploy smoke tests.

## Migration Notes

- The old `?token=<JWT>` pattern in OAuth redirect URLs has been fully replaced by `?code=<CODE>`
- `EXCHANGE_SECRET` env var must be set on both Render and Vercel
- No database migration required
- Rollback plan documented in proposal.md

## Intentional Archive

This archive was executed as a standard archive with no partial archive overrides or stale-checkbox reconciliations. All 13 tasks were verified `[x]` in both the OpenSpec tasks.md and the Engram tasks observation.

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived. Ready for the next change.
