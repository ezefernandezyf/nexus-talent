# Delta Specs: V1.1 Backend Migration

> Combined delta for 6 capabilities. RFC 2119 throughout.

---

## Auth (MODIFIED)

### ADDED Requirements

#### Requirement: Backend Registration and Login
The system MUST provide `POST /api/auth/register` and `POST /api/auth/login` accepting email + password, hashing with bcrypt, and returning a Set-Cookie header with an httpOnly JWT.

- GIVEN a valid email + password with confirmed match / WHEN POST /api/auth/register / THEN 201, Set-Cookie with HS256 JWT, no JWT in response body
- GIVEN valid credentials / WHEN POST /api/auth/login / THEN 200, Set-Cookie with JWT
- GIVEN incorrect password / WHEN POST /api/auth/login / THEN 401, no cookie set
- GIVEN a registered email that already exists / WHEN POST /api/auth/register / THEN 409

#### Requirement: Session Middleware
The system MUST provide a `requireAuth` middleware that reads the JWT from the `nexus-talent-session` cookie, verifies HS256 signature + expiry, and attaches `req.userId`.

- GIVEN a valid JWT cookie / WHEN GET /api/auth/me / THEN 200 with `{ id, email, name, role }`
- GIVEN an expired or malformed JWT cookie / WHEN any protected /api/* request / THEN 401
- GIVEN no cookie / WHEN GET /api/auth/me / THEN 401

#### Requirement: Logout Clears Cookie
`POST /api/auth/logout` MUST clear the session cookie regardless of whether a valid JWT exists.

- GIVEN any request / WHEN POST /api/auth/logout / THEN Set-Cookie with `Max-Age=0`, path=/

### MODIFIED Requirements

#### Requirement: Admin Exposure in Auth Context
The auth context MUST read `isAdmin` from the JWT claims (previously: Supabase `user_metadata.role`).

- GIVEN a JWT with `role: "admin"` / WHEN AuthProvider initializes via GET /api/auth/me / THEN `isAdmin === true`
- GIVEN a JWT without admin role / WHEN AuthProvider initializes / THEN `isAdmin === false`

#### Requirement: Social Provider Enablement Must Be Explicit
Google OAuth availability MUST be controlled by the backend env var `GOOGLE_OAUTH_CLIENT_ID` (previously: Supabase Auth provider config).

- GIVEN `GOOGLE_OAUTH_CLIENT_ID` is not set / WHEN rendering the sign-in page / THEN the Google OAuth button MUST be disabled or hidden
- GIVEN the env var is set / WHEN user clicks Google OAuth / THEN redirect to `GET /api/auth/google` server-side handler

---

## AI Orchestrator (MODIFIED)

### ADDED Requirements

#### Requirement: Server-Side AI Proxy
The system MUST expose `POST /api/ai/analyze` that receives the job description in the body, calls the Groq API server-side, and returns the Zod-validated response.

- GIVEN a valid job description body / WHEN POST /api/ai/analyze / THEN 200 with `JobAnalysisResult` shape validated by Zod
- GIVEN the Groq API returns an error / WHEN the server receives a non-2xx response / THEN 502 with classified error type, no Groq details leaked
- GIVEN the Groq response fails Zod validation / WHEN the server parses the raw LLM output / THEN 500, error logged client receives generic message

#### Requirement: Client-Side API Call Refactor
The client MUST call `/api/ai/analyze` instead of directly calling the Groq API. `VITE_GROQ_API_KEY` MUST be removed from the client bundle.

- GIVEN a user runs an analysis / WHEN the client initiates the AI request / THEN it MUST POST to `/api/ai/analyze` with only the job description in the body
- GIVEN the built frontend bundle is inspected / WHEN searching for `groq` / THEN no API keys or Groq endpoint URLs MUST be found

### REMOVED Requirements

#### Requirement: Provider Adapter Contract (Client-Side)
(Reason: The orchestrator moves server-side; the client no longer manages adapters.)
(Migration: Keep Zod validation in `ai-client`; adapter + retry logic lives server-side.)

---

## Persistence (MODIFIED)

### ADDED Requirements

#### Requirement: Prisma-Based Repository
The system MUST implement `AnalysisRepository` using Prisma + PostgreSQL, preserving the existing interface (`save`, `getAll`, `getById`, `delete`).

- GIVEN the repository is initialized with a Prisma client / WHEN `save(desc, result)` is called / THEN a record is inserted into the `analyses` table with UUID, timestamps, and JSON result
- GIVEN no database connection / WHEN any repository method is called / THEN it MUST throw a typed `DatabaseError`

### MODIFIED Requirements

#### Requirement: Storage Entity Schema Definition
The schema MUST use the Prisma model `analyses` (previously: Zod-only localStorage entity). Zod schemas in `shared/contracts/analysis.ts` MUST remain the single source of truth for DTOs; Prisma schema is the source for persistence columns.

- GIVEN a `SaveJobAnalysis` schema in shared/contracts / WHEN Prisma generates types / THEN they MUST be compatible - shared Zod types MUST be used for API validation and response serialization

#### Requirement: Repository Interface Contract
The `AnalysisRepository` interface MUST remain unchanged in the `web/` package (previously: single codebase). The `web/` package injects an HTTP-backed implementation that calls `/api/analyses` instead of localStorage.

- GIVEN the UI calls `repository.getAll()` / WHEN the HTTP implementation is active / THEN it issues `GET /api/analyses?page=1&limit=10`
- GIVEN the UI calls `repository.delete(id)` / WHEN the HTTP implementation is active / THEN it issues `DELETE /api/analyses/:id`

---

## History (MODIFIED)

### ADDED Requirements

#### Requirement: Paginated Backend List
The system MUST support paginated listing of analyses via `GET /api/analyses` with `page` and `limit` query params.

- GIVEN the user has 25 saved analyses / WHEN GET /api/analyses?page=1&limit=10 / THEN 200 with `{ data: SavedJobAnalysis[], meta: { page, limit, total, totalPages } }`
- GIVEN no analyses exist / WHEN GET /api/analyses / THEN `data: []`, `total: 0`

#### Requirement: Detail and Update Endpoints
The system MUST expose `GET /api/analyses/:id` for detail and `PATCH /api/analyses/:id` for updating notes/summary.

- GIVEN a valid ID / WHEN GET /api/analyses/:id / THEN 200 with the full `SavedJobAnalysis` object
- GIVEN a non-existent ID / WHEN GET /api/analyses/:id / THEN 404
- GIVEN a valid PATCH body with `{ notes }` / WHEN PATCH /api/analyses/:id / THEN 200 with updated record

### MODIFIED Requirements

#### Requirement: Delete Analysis (Backend-Powered)
Deletion MUST be performed via `DELETE /api/analyses/:id` (previously: localStorage `delete()`).

- GIVEN an existing analysis ID / WHEN DELETE /api/analyses/:id / THEN 204, record removed from DB
- GIVEN a non-existent ID / WHEN DELETE /api/analyses/:id / THEN 404

#### Requirement: History Card Data (Unchanged)
The existing UI contract for history card display MUST remain unchanged - same shape returned by `GET /api/analyses`.

- GIVEN a saved analysis in the DB / WHEN GET /api/analyses returns it / THEN the response MUST match the `SavedJobAnalysis` Zod schema from `shared/contracts/`

---

## Shared Contracts (NEW)

### Requirements

#### Requirement: Single Source of Truth for DTOs
All DTOs shared between `server/` and `web/` MUST be defined as Zod schemas in `shared/contracts/` and imported by both packages.

- GIVEN a Zod schema in `shared/contracts/analysis.ts` / WHEN the server validates a request body / THEN it MUST use the same schema the web imports for TypeScript types
- GIVEN a schema changes / WHEN types are regenerated / THEN both server and web MUST compile without type errors

#### Requirement: Package Structure
`shared/` MUST be a workspace package (`@nexus-talent/shared`) exporting from `contracts/`, `types/`, and `utils/` directories.

- GIVEN the workspace is installed / WHEN `pnpm add @nexus-talent/shared` / THEN both server and web can import `@nexus-talent/shared/contracts/auth`
- GIVEN a consumer imports from `@nexus-talent/shared` / WHEN the import path is not found / THEN the build MUST fail - no catch-all re-exports

#### Requirement: No Server Logic in Shared
The `shared/` package MUST NOT contain server-only logic (Prisma, Express, bcrypt) or client-only code (React hooks, browser APIs).

- GIVEN a build check runs on the shared package / WHEN bundling for the web / THEN no Node builtins MUST be present in the output
- GIVEN the same check / WHEN bundling for the server / THEN no browser globals MUST be present

---

## E2E Tests (NEW)

### Requirements

#### Requirement: Auth Smoke Flow
Playwright MUST verify the full auth cycle: register, login, session persistence, logout.

- GIVEN a fresh test user / WHEN the register form is filled and submitted / THEN the user is redirected to the app with a valid session
- GIVEN the user is logged in / WHEN the page is reloaded / THEN the session persists (no login page shown)
- GIVEN the user clicks logout / WHEN the page reloads / THEN the user sees the login page

#### Requirement: Analysis Smoke Flow
Playwright MUST verify that a job description can be submitted for analysis and the result is displayed.

- GIVEN a logged-in user / WHEN a valid job description is pasted and submitted / THEN a loading state appears, followed by the analysis result
- GIVEN the AI proxy returns an error / WHEN the analysis is submitted / THEN an error state is displayed with a retry option

#### Requirement: History Smoke Flow
Playwright MUST verify history list display and delete interaction.

- GIVEN a logged-in user with at least one saved analysis / WHEN navigating to history / THEN saved analysis cards are displayed
- GIVEN an analysis card is visible / WHEN the delete action is triggered / THEN the card is removed from the list
- GIVEN the user has no saved analyses / WHEN navigating to history / THEN the empty state is displayed with a CTA

#### Requirement: Test Environment
E2E tests MUST run against a dedicated test Supabase database (or ephemeral SQLite with Prisma) with isolated test data.

- GIVEN the test suite starts / WHEN `beforeAll` runs / THEN a clean test database is seeded with test data
- GIVEN all tests complete / WHEN `afterAll` runs / THEN the test database is cleaned up
