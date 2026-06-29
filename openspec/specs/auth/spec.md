# Auth — Source of Truth Spec

## ADDED Requirements

> **Note**: The "Admin Exposure in Auth Context" requirement (REQ-AUTH-009) was removed in P5 Frontend Refactor. The auth context no longer exposes `isAdmin` as a meaningful property - it defaults to `false` and is never mutated by store actions. The `AdminRoute` component was deleted.

### Requirement: Signup Must Confirm Password

The signup flow MUST require the user to confirm their password before account creation.
The form MUST reject mismatched passwords before contacting the backend.

#### Scenario: User enters mismatched passwords
- GIVEN the user is creating an account with email and password
- WHEN the confirm password value does not match the password value
- THEN the form MUST show a validation error
- AND the account creation request MUST NOT be sent

#### Scenario: User enters matching passwords
- GIVEN the user is creating an account with matching password values
- WHEN the form is submitted
- THEN the account creation request MUST be allowed to proceed

### Requirement: OAuth Buttons Stay Readable Across Themes

The Google and GitHub OAuth entry points MUST remain readable in light and dark themes.

#### Scenario: User views the auth form in light mode
- GIVEN the user opens the sign-in or sign-up form in light mode
- WHEN the OAuth buttons render
- THEN the button text MUST remain legible against the button background
- AND the provider label MUST be readable without theme-dependent ambiguity

### Requirement: Auth Shell Must Not Expose Placeholder UI

The auth shell MUST not display developer placeholder wording or non-functional help text as a visible control.

#### Scenario: User opens the auth page
- GIVEN the user lands on the sign-in or sign-up shell
- WHEN the header renders
- THEN the visible header controls MUST be intentional user-facing UI
- AND no placeholder text such as "help_outline" MUST be shown

### Requirement: Social Provider Enablement Must Be Explicit

GitHub and Google provider availability MUST be represented clearly so that frontend failures are not mistaken for code bugs when the Supabase provider is not enabled.

#### Scenario: Provider is not enabled in Supabase
- GIVEN a provider is disabled or missing in Supabase Auth settings
- WHEN the user clicks the corresponding OAuth action
- THEN the UI MUST surface a clear provider-not-enabled state
- AND the implementation MUST make the dependency on Supabase configuration explicit

#### Scenario: Disabled provider remains hidden or inactive
- GIVEN a supported provider is not yet configured in Supabase
- WHEN the provider list is rendered
- THEN that provider MUST remain disabled or hidden according to the current config
- AND the code MUST not claim social login is fully available

### Requirement: One-Time Code Store

The system MUST provide an in-memory code store (`Map<string, { jwt, expiresAt }>`) with 60s TTL and single-use enforcement. A periodic cleanup MUST run every 30s via `setInterval(.unref())` to purge expired entries.

#### Scenario: Code stored after OAuth callback

- GIVEN a user completed OAuth and a JWT is signed
- WHEN the callback generates a 64-hex-char code via `randomBytes(32).toString("hex")`
- THEN the code MUST be stored with `expiresAt = Date.now() + 60000`

#### Scenario: Expired codes purged by interval

- GIVEN expired entries exist in the store
- WHEN the 30s interval fires
- THEN expired codes MUST be removed
- AND the interval MUST use `.unref()` to not block process exit

#### Scenario: Single-use - second exchange denied

- GIVEN a code was consumed by a successful exchange
- WHEN a second request attempts the same code
- THEN the endpoint MUST return 404

### Requirement: OAuth Callback Redirects with One-Time Code

The OAuth callback MUST NOT expose the JWT in the redirect URL. It MUST generate a one-time code, store `{ jwt, expiresAt }` in the code store, and redirect to `{CLIENT_URL}/api/auth/session?code=<CODE>&redirect=<target>`.

#### Scenario: Successful OAuth callback

- GIVEN Google redirects back with a valid authorization code and anti-CSRF state
- WHEN the server exchanges the Google code, signs a JWT, and stores it behind a one-time code
- THEN the redirect URL MUST be `?code=<64-hex>&redirect=/app/analysis`
- AND the JWT MUST NOT appear in any query parameter

### Requirement: Code Exchange Endpoint

The system MUST expose `POST /api/auth/exchange` accepting `{ code }` as JSON. It MUST verify `X-Exchange-Secret` matches `EXCHANGE_SECRET` (401 on mismatch). On valid code, it MUST return `200 { token }` and delete the code. On missing/expired code, it MUST return 404.

#### Scenario: Valid exchange returns JWT

- GIVEN a valid code exists and the request carries a correct `X-Exchange-Secret`
- WHEN `POST /api/auth/exchange` receives `{ code: "<valid>" }`
- THEN the response MUST be `200 { token: "<JWT>" }`
- AND the code MUST be deleted from the store

#### Scenario: Wrong or missing secret returns 401

- GIVEN any request to the exchange endpoint
- WHEN `X-Exchange-Secret` is missing or mismatched
- THEN the response MUST be `401 { error: "Unauthorized" }`

#### Scenario: Expired or unknown code returns 404

- GIVEN the code does not exist in the store or has expired
- WHEN the exchange endpoint receives the code
- THEN the response MUST be `404 { error: "Code not found or expired" }`

### Requirement: Edge Function Exchanges Code for Cookie

The Vercel Edge Function (`api/auth/session.ts`) MUST read `?code=` from the URL, `POST` it to `{RENDER_URL}/api/auth/exchange` with the `X-Exchange-Secret` header, set the resulting JWT as `nexus-talent-session` httpOnly cookie on `.nexustalent.vercel.app`, and redirect to the target path. It MUST NOT read `?token=`.

#### Scenario: Successful exchange sets cookie

- GIVEN the Edge Function receives `?code=<valid>&redirect=/app/analysis`
- WHEN it POSTs the code and receives `{ token }`
- THEN it MUST set cookie `nexus-talent-session=<token>` (HttpOnly; Secure; SameSite=Lax; Domain=.nexustalent.vercel.app; Path=/; Max-Age=604800)
- AND redirect to `/app/analysis`

#### Scenario: Exchange failure redirects to sign-in

- GIVEN the Edge Function receives a code but the exchange POST fails or returns non-200
- WHEN the exchange errors
- THEN the response MUST redirect to `{origin}/auth/sign-in?error=exchange_failed`

#### Scenario: Missing code redirects to sign-in

- GIVEN the request has no `?code=` parameter
- WHEN the handler runs
- THEN the response MUST redirect to `{origin}/auth/sign-in`

## REMOVED Requirements

### Requirement: JWT in OAuth Redirect URL Query Parameter

(Reason: The JWT appearing as a query parameter in the 302 OAuth redirect exposes the token to access logs, browser waterfall traces, and intermediate proxies.)
(Migration: `?token=<JWT>` replaced by `?code=<CODE>`. The Edge Function now POSTs to `/api/auth/exchange` instead of reading the token directly. Cookie format is unchanged.)
