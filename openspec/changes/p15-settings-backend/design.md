# Technical Design: P15 — Settings Backend

## Overview

Add per-user settings persistence via a `UserSettings` table (1:1 with Profile), a `GET/PUT /api/settings` CRUD pair with auto-creation of defaults, OAuth identity linking through the existing Google flow (`?link=true`), and per-user rate-limit tier resolution extending the in-memory IP-based limiter. Follows the existing screaming-architecture pattern (thin router, service with business logic, Zod schemas in `shared/`). Frontend gets a `useAppSettings` hook with localStorage cache + API background sync.

## Data Model

### Prisma — New `UserSettings` model

```prisma
model UserSettings {
  userId        String   @id
  theme         String   @default("light")
  emailDigest   Boolean  @default(true)
  rateLimitTier String   @default("default")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  profile Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `userId` | `String` | — | PK + FK → `Profile.id`, cascade delete |
| `theme` | `String` | `"light"` | Enum: `light`, `dark` |
| `emailDigest` | `Boolean` | `true` | — |
| `rateLimitTier` | `String` | `"default"` | Enum: `default`, `relaxed`, `strict` |
| `createdAt` / `updatedAt` | `DateTime` | `now()` / `@updatedAt` | — |

**Migration**: Additive only — no column drops or data transforms. `pnpm exec prisma migrate dev --name add_user_settings`.

### Shared Zod Schemas (`shared/src/schemas.ts`)

```ts
export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  emailDigest: z.boolean(),
  rateLimitTier: z.enum(["default", "relaxed", "strict"]),
});

export const userSettingsUpdateSchema = userSettingsSchema.partial().strict();

export type UserSettingsDTO = z.infer<typeof userSettingsSchema>;
export type UserSettingsUpdateDTO = z.infer<typeof userSettingsUpdateSchema>;
```

`userSettingsUpdateSchema` is `partial().strict()` — any subset of fields is valid; unknown fields are rejected. Follows the `profileUpdateSchema` pattern: fully zod-validated, `strict()` gate.

## Architecture

### File Tree (`server/src/settings/`)

```
server/src/settings/
├── settings.router.ts     # GET/PUT /api/settings, requireAuth + validate middleware
├── settings.service.ts    # getOrCreate(id), upsert(id, data) → UserSettingsDTO
└── settings.router.test.ts
```

Follows profile module's pattern: router file contains inline handlers (not a separate controller file), importing from `settings.service.ts` for business logic. This is the established pattern for CRUD modules in this project.

### Dependency Flow

```
settings.router.ts
  ├── requireAuth (auth middleware)
  ├── validate(userSettingsUpdateSchema) (for PUT only)
  └── settings.service.ts
        └── prisma (userSettings table)
```

### Module Registration (`app.ts`)

Add one line after `profileRouter`:
```ts
import { settingsRouter } from "../settings/settings.router.js";
// ...
app.use("/api/settings", settingsRouter);
```

## API Contracts

### GET `/api/settings`

| Aspect | Detail |
|--------|--------|
| **Auth** | `requireAuth` — returns 401 without valid session |
| **Behavior** | Query `UserSettings` by `req.userId`. No row → `create()` with defaults → return defaults. Existing row → return as-is. |
| **Response 200** | `{ theme: "light" \| "dark", emailDigest: boolean, rateLimitTier: "default" \| "relaxed" \| "strict" }` |
| **Errors** | 401 (no session), 500 (DB failure) |

Idempotent — repeated GETs return the same data.

### PUT `/api/settings`

| Aspect | Detail |
|--------|--------|
| **Auth** | `requireAuth` — returns 401 without valid session |
| **Validation** | `validate(userSettingsUpdateSchema)` middleware — rejects unknown fields (strict), validates enum values |
| **Behavior** | `upsert` via Prisma: if row exists → update only provided fields; if not → create with defaults + provided overrides |
| **Response 200** | Full `UserSettingsDTO` with all three fields (after upsert) |
| **Errors** | 400 (Zod validation), 401 (no session), 500 (DB failure) |

Partial update example: `PUT { "theme": "dark" }` on existing `{ theme: "light", emailDigest: true, rateLimitTier: "default" }` → returns `{ theme: "dark", emailDigest: true, rateLimitTier: "default" }`.

## OAuth Linking Flow

### State Cookie Encoding

`googleLogin` accepts `?link=true` query param. When present, the anti-CSRF state cookie value encodes the linking intent:
- **Without `?link=true`**: state = `randomBytes(32).toString("hex")` (unchanged)
- **With `?link=true`**: state = `"link:" + randomBytes(32).toString("hex")`

The `nexus-talent-oauth-state` cookie still uses the same httpOnly/sameSite/path/maxAge settings.

Middleware: when `?link=true` is present, `requireAuth` runs BEFORE `googleLogin`. Without it, no auth required (existing flow). The router wires this as:
```ts
authRouter.get("/oauth/google", (req, res, next) => {
  if (req.query.link === "true") return requireAuth(req, res, next);
  next();
}, controller.googleLogin);
```

### Callback Detection

In `googleCallback`, after validating the CSRF state:
```ts
const isLinkMode = expectedState.startsWith("link:");
if (isLinkMode) {
  // Parse the real random suffix for CSRF validation
  const actualState = expectedState.slice(5); // remove "link:" prefix
  if (actualState !== state) { /* 403 */ }
  // Call linkIdentity instead of handleOAuthCallback
  await oauthService.linkIdentity(code, req.userId!);
  // Redirect to settings page
  res.redirect(`${clientUrl}/app/settings?linked=google`);
} else {
  // Existing flow unchanged
  const result = await oauthService.handleOAuthCallback(code);
  // ... one-time code + redirect as before
}
```

### `linkIdentity()` (new method in `oauth.service.ts`)

```ts
export async function linkIdentity(code: string, userId: string): Promise<void> {
  const tokens = await exchangeCodeForTokens(code);
  const googleUser = await getGoogleUser(tokens.access_token);
  await prisma.profile.update({
    where: { id: userId },
    data: { googleId: googleUser.sub, avatarUrl: googleUser.picture },
  });
}
```

No JWT generation, no redirect-to construction — just updates the existing Profile row.

### Unlink: `DELETE /api/auth/oauth/google`

New route in `auth.router.ts`:
```ts
authRouter.delete("/oauth/google", requireAuth, async (req, res) => {
  await prisma.profile.update({
    where: { id: req.userId },
    data: { googleId: null },
  });
  res.status(200).json({ message: "Google account unlinked" });
});
```

Idempotent: if `googleId` is already null, Prisma update is a no-op, still returns 200.

## Rate Limiter Changes

### Tier-to-Limits Mapping

```ts
const TIER_LIMITS: Record<string, { windowMs: number; max: number }> = {
  relaxed: { windowMs: 60_000, max: 60 },
  default: { windowMs: 60_000, max: 30 },
  strict:  { windowMs: 60_000, max: 10 },
};
const IP_FALLBACK = { windowMs: 60_000, max: 20 };
```

### Rate Limiter Extension

Add optional `userId` parameter to key resolution. The middleware:
1. If `req.userId` is present: query `UserSettings` by userId → use tier limits if row exists, otherwise fall back to IP
2. If `req.userId` is absent (unauth'd): use IP fallback (20 req / 60s)

The key for the in-memory `Map` becomes:
- Auth'd with UserSettings row: `${userId}:${tier}` (rate-limited per user)
- Auth'd without UserSettings row: `${ip}` (IP fallback)
- Unauth'd: `${ip}` (IP fallback)

**Important**: The per-user query on every AI request is a DB call. To avoid adding latency, the settings service exposes a lightweight `getUserRateLimitTier(userId)` that only reads `UserSettings.rateLimitTier` and caches nothing (the existing query is already fast). If needed, a later optimization can add request-level memoization.

### Integration Point

In `analysis.router.ts`, the rate limiter middleware is already applied before the handler. After this change, the middleware reads `req.userId` (set by `optionalAuth` or `requireAuth`) and resolves the key accordingly. No router changes needed beyond ensuring `optionalAuth` runs before rate limiting on the AI route.

## Frontend Changes (minimal)

### `useAppSettings` hook (`web/src/features/settings/hooks/useAppSettings.ts`)

```ts
export function useAppSettings() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Read: fetch from API on mount, fall back to localStorage
  const { data } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => fetch("/api/settings").then(r => r.json()),
  });

  // Write: sync theme change to API in background
  const syncMutation = useMutation({
    mutationFn: (settings: Partial<UserSettingsDTO>) =>
      fetch("/api/settings", { method: "PUT", body: JSON.stringify(settings), headers: { "Content-Type": "application/json" } }),
  });

  // On theme change: update localStorage immediately, queue API sync
  // On mount: if API returns a different theme than localStorage, reconcile (API wins)
}
```

**Theme sync pattern**: localStorage is the fast cache (instant UI), API is the source of truth (cross-device persistence). On mount, API response wins if different from localStorage. On theme change, localStorage updates immediately (no flicker), then API call fires in background.

### `theme.tsx` changes

In `ThemeProvider`, after setting `localStorage` in the `useEffect`, also call `syncSettings({ theme })` from `useAppSettings` (if user is authenticated). No changes to the existing `theme.tsx` API — `useTheme()` still works identically.

## Test Strategy

| Layer | What | Approach |
|-------|------|----------|
| **Unit — settings.service** | `getOrCreate` auto-creates defaults, `upsert` partial update preserves fields | vitest + vi.mock prisma |
| **Unit — settings.router** | 401 without auth, 200 GET/PUT, 400 on invalid enum | Express app with supertest or mockReqRes pattern |
| **Unit — oauth.service** | `linkIdentity` updates Profile.googleId, `exchangeCodeForTokens` unchanged | vitest + vi.mock prisma, mock fetch |
| **Unit — rate-limiter** | Per-user tier key resolution, IP fallback | vitest — isolated unit tests of key-building logic |
| **Integration — auth controller** | `googleLogin?link=true` requires auth, callback with `link:` state calls linkIdentity | Express test app + mock fetch |
| **Frontend — useAppSettings** | localStorage read/write, API sync on theme change | React Testing Library |

## Migration Plan

1. **Prisma migration**: `add_user_settings` — additive, no rollback complexity
2. **Shared schemas**: Add `userSettingsSchema`, `userSettingsUpdateSchema` + types + barrel export
3. **settings.service.ts**: `getOrCreate` + `upsert` with Prisma
4. **settings.router.ts**: GET/PUT routes with `requireAuth` + `validate`
5. **app.ts wiring**: Add `/api/settings` router
6. **OAuth linking**: `googleLogin` → detect `?link=true` → requireAuth middleware → encode `link:` prefix in state cookie
7. **googleCallback**: Detect `link:` prefix → call `linkIdentity()` instead of `handleOAuthCallback()`
8. **Unlink route**: DELETE `/api/auth/oauth/google` in auth.router
9. **Rate limiter**: Extend key resolution to accept optional userId + tier lookup
10. **Frontend**: `useAppSettings` hook + `theme.tsx` API sync
11. **Enable OAuth UI**: Set `ACCOUNT_LINKING_AVAILABLE = true` in `useSettings.ts`

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OAuth link breaks existing login | Link mode only activated by `?link=true` param; default flow unchanged. `link:` prefix in state cookie is only visible server-side (httpOnly). |
| Theme flicker on slow API | localStorage is the instant cache; API is background sync. On mount, API response wins if different, but localStorage prevents any flash. |
| DB call on every AI request for rate limit tier | `UserSettings` lookup by PK (userId) is a single indexed read — negligible latency. Can add request-level memoization later if needed. |
| `linkIdentity` called without valid session | The inline `requireAuth` call on `?link=true` gates the entire flow. No session → 401 before redirect to Google. |
| Race condition: two tabs change theme simultaneously | Last-write-wins via API upsert. localStorage in both tabs updates optimistically; API sync on each change converges. |
