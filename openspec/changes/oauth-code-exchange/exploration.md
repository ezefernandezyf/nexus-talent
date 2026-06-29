## Exploration: OAuth One-Time Code Exchange

### Current State

The OAuth flow today works as follows:

1. User clicks "Sign in with Google" from the web app (via `AuthProvider.tsx` → `window.location.href = "${RENDER_BACKEND_URL}/api/auth/oauth/google"`)
2. Browser redirects to `GET /api/auth/oauth/google` on Render
3. Render generates anti-CSRF state, stores it in `nexus-talent-oauth-state` cookie (10min TTL), redirects to Google consent screen
4. Google redirects back to `GET /api/auth/oauth/google/callback` on Render
5. Render validates the state cookie (CSRF check), exchanges the Google code for tokens via `fetch()` to `oauth2.googleapis.com/token`, fetches user info from `www.googleapis.com/oauth2/v3/userinfo`, creates/links the user in Prisma, signs a JWT
6. Render redirects to: `${CLIENT_URL}/api/auth/session?token=<JWT>&redirect=/app/analysis`
   - **Security gap**: The JWT appears as a query parameter in the 302 redirect URL
7. Vercel Edge Function (`api/auth/session.ts`) reads `?token=` from query params, constructs a `Set-Cookie` header with `nexus-talent-session=<JWT>; Domain=.nexustalent.vercel.app; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`, and returns 302 to `/app/analysis`
8. Browser arrives at the app with the httpOnly cookie set. `AuthCallbackPage.tsx` calls `useSession().refetch()` → `GET /api/auth/me` → Render reads the cookie → returns user data

**Why the JWT-in-URL matters**: Vercel access logs, browser network waterfall tabs, and intermediate proxies can log or expose the URL containing the JWT. While the address bar shows only `/api/auth/session?...` briefly, the token is in the raw URL path.

### Affected Areas

| File | Why Affected |
|------|-------------|
| `server/src/auth/auth.controller.ts` | `googleCallback()` (line 137) builds the redirect URL with `?token=<JWT>`. Must change to use `?code=<CODE>`. Also needs a new `exchangeCode()` handler. |
| `server/src/auth/auth.router.ts` | Must add `POST /exchange` route for the code exchange endpoint |
| `server/src/auth/oauth.service.ts` | `handleOAuthCallback()` returns a `token` that ends up in the URL. May need a separate path that returns `{code, redirectTo}` instead. |
| `server/src/auth/code-store.ts` | **New file** — in-memory one-time code store with TTL (pattern: `Map<string, { jwt, expiresAt }>`) |
| `api/auth/session.ts` | Must change from reading `?token=` to reading `?code=`, then make a server-to-server `POST /api/auth/exchange` to Render to get the JWT |
| `api/package.json` | May need creation — currently the `api/` directory has no `package.json`. The Edge Function runs without deps (uses only native `fetch` + `URL`), but if we add complexity, a minimal `package.json` may be warranted. |
| `web/src/features/auth/AuthProvider.tsx` | No change needed — OAuth still redirects to backend endpoint. The URL changes but the flow remains a browser redirect. |
| `web/src/features/auth/pages/AuthCallbackPage.tsx` | No change needed — still calls `useSession().refetch()` after the redirect chain completes. |
| `server/src/infra/rate-limiter.ts` | Reference pattern — the existing in-memory `Map` with TTL cleanup is the exact pattern to replicate for the code store |
| `openspec/specs/auth/spec.md` | May need to add requirement for the one-time code exchange flow |

### Current Architecture: Text Diagram

```
Browser                    Vercel                     Render
  │                        │                          │
  │── GET /oauth/google ──────────────────────────►   │
  │◄─── 302 → Google consent ◄─────────────────────── │
  │── Google callback ─────────────────────────────►  │
  │                        │    exchange code for      │
  │                        │    tokens, upsert user,   │
  │                        │    sign JWT               │
  │◄─── 302 /api/auth/session?token=<JWT> ◄────────── │
  │                        │                          │
  │── GET /api/auth/session?token=<JWT> ──► Edge FN   │
  │◄─── 302 /app/analysis + Set-Cookie ◄───────────── │
  │                        │                          │
  │── GET /app/analysis ───► Proxy ──────────────────►│
  │                        │   (cookie forwarded)      │
  │◄──── HTML ◄─────────── ◄──────────────────────────│
```

### Proposed Approach: One-Time Code Exchange

```
Browser                    Vercel                     Render
  │                        │                          │
  │── GET /oauth/google ──────────────────────────►   │
  │◄─── 302 → Google consent ◄─────────────────────── │
  │── Google callback ─────────────────────────────►  │
  │                        │    exchange code for      │
  │                        │    tokens, upsert user,   │
  │                        │    sign JWT,              │
  │                        │    store in Map(code→JWT) │
  │◄─── 302 /api/auth/session?code=<RANDOM_CODE> ◄── │
  │                        │                          │
  │── GET /api/auth/session?code=<CODE> ──► Edge FN   │
  │                        │  POST /api/auth/exchange  │
  │                        │  ───── {code} ────────►  │
  │                        │  ◄──── {jwt} ◄─────────  │
  │◄─── 302 /app/analysis + Set-Cookie ◄───────────── │
  │                        │                          │
```

### Key Design Decisions

**1. Code Storage: In-memory Map (follow rate-limiter pattern)**
- The `rate-limiter.ts` already shows the pattern: `Map<string, Entry>` with `setInterval()` cleanup with `.unref()`
- Create `code-store.ts` with a `Map<string, { jwt: string; expiresAt: number }>`
- TTL: 60 seconds (short window — the code is exchanged immediately during the 302 redirect)
- No persistence needed — codes are single-use and ephemeral

**2. Code Generation: crypto.randomBytes**
- Reuse the existing pattern from `oauth.service.ts` line 45: `randomBytes(32).toString("hex")`
- 32 bytes → 64 hex chars — sufficient entropy for one-time codes

**3. Exchange Endpoint: POST /api/auth/exchange**
- Edge Function sends `{ code: "..." }` as JSON body
- Server looks up code in Map, returns JWT, deletes code from Map
- **Race condition**: if two concurrent requests use the same code, only the first succeeds; the second gets 404
- Response shape: `{ token: "..." }`

**4. Edge Function Changes**
- Current: reads `?token=` directly → sets cookie
- New: reads `?code=` → `POST /api/auth/exchange` with the code → receives JWT → sets cookie
- Uses native Edge Runtime `fetch()` — no new dependencies needed
- Must handle exchange failure (e.g., code expired or already used) → redirect to sign-in page

**5. Caller identification**
- The exchange endpoint must verify the caller is Vercel (not an external attacker guessing codes)
- Options:
  a. **Shared secret in header**: `POST /api/auth/exchange` with `X-Exchange-Secret: <env var>` header — Render checks it matches `EXCHANGE_SECRET`
  b. **IP whitelist**: Verify request comes from Vercel's IP range (less reliable)
  c. **No additional auth** (code entropy alone): the 64-hex-char code has 256 bits of entropy; guessing is infeasible within the 60s TTL

### Risks

1. **Edge Function failure**: If the exchange POST to Render fails (Render restart, network blip), the user sees a redirect to sign-in. This is a degraded UX but not a security issue. The user just clicks "Sign in with Google" again.

2. **Race condition on code consumption**: Two simultaneous requests with the same code — only one succeeds. Mitigation: the code is single-use, deleted on first successful exchange. The second request gets a 404, and the Edge Function redirects to sign-in.

3. **Code TTL window**: 60 seconds of exposure for the random code. Far safer than a JWT (which contains user claims and would be valid for 7 days), but still a window. Mitigation: the code is random bytes, not a signed token; without the exchange endpoint, it's useless.

4. **Render cold start**: Render may cold-start on the exchange POST. The JWT is already computed at this point — the exchange just does a Map lookup, which is O(1). But the cold start adds latency (~2-5s) to the redirect chain. The user will see a brief pause between the Google callback and arriving at the app.

5. **CORS on exchange endpoint**: The POST comes from the Vercel Edge Runtime, not from a browser. CORS is not relevant here — it's a server-to-server call with no browser origin. The `cors()` middleware won't block it.

6. **Testing complexity**: The exchange flow involves two separate deployments (Vercel + Render) communicating server-to-server. Local dev testing requires both running. Mitigation: the exchange can be tested in isolation by calling the POST endpoint directly with a known code.

### Ready for Proposal

Yes — the exploration is complete. The proposed approach has a clear pattern to follow (the existing rate-limiter for in-memory storage), keeps changes minimal (one new file, two modified server files, one modified Edge Function), and eliminates the JWT-in-URL security gap. The orchestrator should proceed to `sdd-propose` with the one-time code exchange approach.
