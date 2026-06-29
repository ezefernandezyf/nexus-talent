# Design: OAuth One-Time Code Exchange

## Technical Approach

Replace the JWT-in-URL OAuth redirect with a one-time code exchange. After successful OAuth, Render stores a single-use code→JWT mapping in an in-memory `Map` (60s TTL). The redirect carries only the opaque code. The Vercel Edge Function reads the code, POSTs server-to-server to Render's exchange endpoint to retrieve the JWT, then sets the httpOnly cookie. The JWT never appears in any URL.

## Architecture Decisions

### Decision: Code Store — In-memory Map (rate-limiter pattern)
| Option | Tradeoff | Verdict |
|--------|----------|---------|
| Redis | Adds infra dep for ephemeral 60s data | ❌ Reject |
| DB table (Prisma) | Overkill — single-use codes, no persistence | ❌ Reject |
| `Map<string, {jwt,expiresAt}>` | Same pattern as `rate-limiter.ts`, zero deps | ✅ Adopt |

### Decision: Caller Auth — Shared Secret Header
| Option | Tradeoff | Verdict |
|--------|----------|---------|
| IP whitelist | Vercel IP ranges change; brittle | ❌ Reject |
| Code entropy only (256 bits) | Sufficient for 60s window, but no defense-in-depth | ❌ Reject |
| `X-Exchange-Secret` → `EXCHANGE_SECRET` env var | Simple check, defense-in-depth, matches Vercel→Render trust model | ✅ Adopt |

### Decision: Rate Limiting on Exchange
| Option | Tradeoff | Verdict |
|--------|----------|---------|
| Apply auth rate-limiter (5/15min) | Blocks legitimate retries on Render cold-start | ❌ Reject |
| No rate limiting | Brute-force protected by shared secret + 256-bit code entropy in 60s | ✅ Adopt |

## Sequence Flow

```
Browser                   Vercel Edge               Render
  │                         │                        │
  │── GET /oauth/google ──────────────────────────►  │
  │◄── 302 → Google consent ◄─────────────────────── │
  │── callback ──────────────────────────────────►  │
  │                         │  1. Exchange Google    │
  │                         │     code for tokens    │
  │                         │  2. Fetch user info    │
  │                         │  3. Upsert in Prisma   │
  │                         │  4. sign(JWT)          │
  │                         │  5. codeStore.set(jwt) │
  │◄── 302 ?code=<64hex>&redirect=/app/analysis ◄── │
  │                         │                        │
  │── GET /api/auth/session?code=... ──►             │
  │                         │  POST /api/auth/exchange│
  │                         │  {code} + X-Exchange-  │
  │                         │  Secret ───────────►  │
  │                         │    codeStore.get(code) │
  │                         │    → delete entry      │
  │                         │  ◄── {token} ◄─────── │
  │◄── 302 /app/analysis + Set-Cookie ◄────────────  │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/auth/code-store.ts` | Create | `Map<string,{jwt,expiresAt}>`, 60s TTL, single-use `get()`, 30s cleanup with `.unref()` |
| `server/src/auth/auth.controller.ts` | Modify | `googleCallback()`: store code → redirect `?code=` instead of `?token=`. Add `exchangeCode()` handler |
| `server/src/auth/auth.router.ts` | Modify | Add `POST /exchange` route to `exchangeCode` handler |
| `api/auth/session.ts` | Modify | Read `?code=`, async POST to exchange, handle 401/404/network error → redirect to sign-in |

## Interfaces / Contracts

```typescript
// code-store.ts
interface CodeEntry { jwt: string; expiresAt: number }

class CodeStore {
  private store = new Map<string, CodeEntry>();
  
  set(jwt: string): string       // randomBytes(32).toString("hex")
  get(code: string): string | null  // deletes entry on access
  #sweep(): void                  // runs every 30s via setInterval().unref()
}

// POST /api/auth/exchange
// Request headers: { "X-Exchange-Secret": "<shared>" }
// Request body:    { "code": "64-hex-chars" }
// 200 response:    { "token": "eyJhbG..." }
// 401 response:    { "error": "Invalid exchange secret" }
// 404 response:    { "error": "Code not found or expired" }
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `code-store.ts` | Store → retrieve → re-retrieve returns null (single-use). Expire via manual sweep. Pure logic, no deps |
| Unit | `exchangeCode` controller | Mock codeStore, verify 200 (valid code), 401 (bad secret), 404 (miss/expired) |
| Integration | Full OAuth redirect | Hit `/oauth/google/callback` with a mocked OAuth code, verify `?code=` in Location header (no `?token=`) |
| E2E | Existing Playwright OAuth flow | No structural change — test still exercises the same redirect chain. Verify `exchange_failed` error path |

## Migration / Rollout

**Env vars** (set BEFORE deploy, must match):
- Render: `EXCHANGE_SECRET=<crypto.randomBytes(32).toString("hex")>`
- Vercel: `EXCHANGE_SECRET=<same value>`

**Deploy order**: (1) set env vars on both platforms, (2) deploy server to Render (new endpoint + modified callback), (3) deploy Vercel (modified Edge Function). No DB migration. Rollback: revert session.ts + controller + delete route + remove code-store.ts + drop env var.

## Open Questions

None.
