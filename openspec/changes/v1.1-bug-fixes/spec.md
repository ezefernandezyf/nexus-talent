# Delta Specs - V1.1 Bug Fixes

## MODIFIED Requirements

### [api-client] 401 Interceptor (REQ-API-002)

The Axios instance MUST have a response interceptor. On 401 responses, it MUST clear the auth store and redirect to `/auth/sign-in` UNLESS the current path is `/` or `/privacy`.
(Previously: redirected on ALL 401 responses unconditionally.)

#### Scenario: 401 on protected route = redirect

- GIVEN an expired or missing cookie
- WHEN any API call returns 401 on a path that is NOT `/` or `/privacy`
- THEN the interceptor clears the auth store
- AND redirects the browser to `/auth/sign-in`

#### Scenario: 401 on landing page = no redirect

- GIVEN an unauthenticated user on `/`
- WHEN any API call returns 401
- THEN the landing page loads normally without redirect

#### Scenario: 401 on privacy page = no redirect

- GIVEN an unauthenticated user on `/privacy`
- WHEN any API call returns 401
- THEN the privacy page loads normally without redirect

### [auth-client] OAuth Flow (REQ-AUTH-005)

OAuth MUST redirect the browser directly to the Render backend (`GET /api/auth/oauth/google`) without passing through a Vercel proxy. The state cookie domain and callback domain MUST match.
(Previously: redirect went through Vercel proxy causing cookie domain mismatch for callbacks to Render.)

#### Scenario: OAuth sign-in succeeds

- GIVEN the user clicks "Sign in with Google"
- WHEN the OAuth action is triggered
- THEN the browser redirects directly to the Render backend at `GET /api/auth/oauth/google`
- AND the state cookie domain matches the callback domain
- AND after Google consent, the callback page calls `restoreSession()`
- AND the user becomes authenticated

### [observability-errors] Domain Error Mapper

The system MUST include an error mapper that transforms technical errors into user-friendly messages. The mapper SHALL distinguish between `db_error`, `auth_error`, and `api_error` by checking the error `type` property, not only the presence of `.status`.
(Previously: the mapper treated all errors with a `.status` as `db_error`.)

#### Scenario: Mapping an AI API 502 error

- GIVEN the Groq API returns a 502 response
- WHEN the error is passed to the error mapper
- THEN it MUST return an `api_error` label with a user-friendly message
- AND the frontend toast MUST display "API error", not "Database error"

#### Scenario: Mapping a Zod Validation Error

- GIVEN a Zod validation fails during data parsing
- WHEN the ZodError is passed to the error mapper
- THEN it MUST return a clear message indicating which fields were invalid, avoiding raw JSON or stack traces in the UI.

### [auth] Auth Shell Header Text

The auth page shell SHALL display only the page title without any kicker eyebrow or subtitle text.
(Previously: displayed a kicker/subtitle like "Sesión persistente" on sign-in and "Alta incremental" on sign-up.)

#### Scenario: Sign-in page header

- GIVEN the user navigates to `/auth/sign-in`
- WHEN the auth shell renders
- THEN the header shows only the title (e.g., "Inicia sesión")
- AND no kicker or subtitle text is visible

#### Scenario: Sign-up page header

- GIVEN the user navigates to `/auth/sign-up`
- WHEN the auth shell renders
- THEN the header shows only the title (e.g., "Creá tu cuenta")
- AND no kicker or subtitle text is visible

## ADDED Requirements

### [web-styles] Material Symbols CSS Import Ordering

CSS `@import` for Material Symbols SHALL be placed before all `@font-face` declarations so browsers do not silently drop the import.

#### Scenario: Material Symbols load correctly

- GIVEN the application CSS file is loaded by the browser
- WHEN the `@import` for Material Symbols appears before any `@font-face` declaration
- THEN the icon font loads and renders ligatures as icons, not fallback text

### [observability-errors] GROQ API Key Configuration

The Render deployment SHALL have the `GROQ_API_KEY` environment variable configured with a valid key so the AI analysis endpoint can authenticate with Groq.

#### Scenario: AI analysis with valid key

- GIVEN `GROQ_API_KEY` is set in Render environment variables
- WHEN `POST /api/ai/analyze` is called with a valid job description
- THEN the endpoint returns 200 with analysis results

#### Scenario: AI analysis without key

- GIVEN `GROQ_API_KEY` is missing or invalid
- WHEN `POST /api/ai/analyze` is called
- THEN the endpoint returns 502
- AND the error mapper labels it as `api_error`

### [content-cleanup] Em-Dash Removal in TypeScript Files

All `.ts` and `.tsx` files SHALL use hyphens (U+002D) instead of em-dashes (U+2014) in user-visible strings and code comments. No automated replacement SHALL be applied to `.md` documentation files.

#### Scenario: No em-dashes in source

- GIVEN a codebase scan of all `.ts` and `.tsx` files
- WHEN searching for U+2014 (em-dash) characters
- THEN zero results are found
- AND all user-visible strings use U+002D hyphens instead
