# Delta for Auth Client

> Modifies: `openspec/specs/auth-client/spec.md`

## MODIFIED Requirements

### Requirement: React Query Session + Zustand Status (REQ-AUTH-001)

The frontend MUST manage session data (`user`, `isAdmin`) via React Query `useSession()` hook (GET /api/auth/me). UI-only auth status MAY live in a thin Zustand slice: `{ status: "unknown" | "loading" | "authenticated" | "unauthenticated" }`. No user object, mutations, or tokens SHALL exist in Zustand beyond the status field. No session token MAY exist in JavaScript — httpOnly cookies only.
(Previously: monolithic Zustand store held user, status, and all auth actions.)

#### Scenario: Session restore
- GIVEN a valid httpOnly JWT cookie
- WHEN the app mounts
- THEN `useSession()` calls GET /api/auth/me via React Query
- AND the Zustand `auth-status` slice transitions status field: unknown → loading → authenticated
- AND `useSession().data` is populated from the response

#### Scenario: No session
- GIVEN no cookie or expired cookie
- WHEN the app mounts
- THEN GET /api/auth/me returns 401
- AND React Query sets `useSession().data` to `null`
- AND Zustand status becomes unauthenticated

#### Scenario: Zustand holds only UI status
- GIVEN the system is running
- WHEN inspecting the Zustand devtools
- THEN the auth-related store SHALL contain only `{ status: AuthStatus }`
- AND SHALL NOT contain `user`, `isAdmin`, `login`, `register`, `logout`, or `restoreSession`

### Requirement: AuthProvider as Thin Sync Layer (REQ-AUTH-002)

AuthProvider MUST call `GET /api/auth/me` via React Query's `queryClient.ensureQueryData` on mount and SHALL be a thin wrapper that syncs the React Query session with the Zustand status slice. On 200→authenticated with user. On 401→unauthenticated.
(Previously: AuthProvider called `restoreSession()` on the Zustand store directly.)

#### Scenario: Valid session
- GIVEN a valid cookie
- WHEN AuthProvider mounts
- THEN GET /api/auth/me returns 200 with user payload
- AND React Query caches the session under `["auth", "session"]`
- AND Zustand status becomes authenticated

### Requirement: Login and Register as React Query Mutations (REQ-AUTH-003)

Login MUST be a React Query mutation calling POST /api/auth/login → Set-Cookie → invalidate session query. Register MUST be a React Query mutation calling POST /api/auth/register with the same invalidation pattern.
(Previously: login and register were Zustand store actions that called fetch() directly and set store state.)

#### Scenario: Login mutation
- GIVEN valid credentials
- WHEN `useLoginMutation().mutate({ email, password })` is called
- THEN it POSTs /api/auth/login with credentials
- AND on success invalidates `["auth", "session"]` query
- AND Zustand status transitions to authenticated

#### Scenario: Register mutation
- GIVEN valid registration data
- WHEN `useRegisterMutation().mutate({ email, password, name })` is called
- THEN it POSTs /api/auth/register
- AND on success invalidates `["auth", "session"]` query

### Requirement: Logout as React Query Mutation (REQ-AUTH-004)

Logout MUST be a React Query mutation calling POST /api/auth/logout. On success it SHALL clear the session query cache and reset the Zustand status to unauthenticated.
(Previously: logout was a Zustand store action.)

#### Scenario: Logout mutation
- GIVEN an authenticated session
- WHEN `useLogoutMutation().mutate()` is called
- THEN it POSTs /api/auth/logout to clear the cookie
- AND `queryClient.setQueryData(["auth", "session"], null)` clears cache
- AND Zustand status resets to unauthenticated

### Requirement: Guard Redirects (REQ-AUTH-006)

ProtectedRoute MUST redirect to /auth/sign-in when `useSession().data` is `null`. PublicAuthRoute MUST redirect to /app when `useSession().data` is not `null`.
(Previously: guards read from Zustand `useAuthStore` to check `status`.)

#### Scenario: Protected route redirect
- GIVEN `useSession().data` is `null`
- WHEN navigating to any /app/* route
- THEN ProtectedRoute redirects to /auth/sign-in

#### Scenario: Public route redirect
- GIVEN `useSession().data` is not `null`
- WHEN navigating to /auth/sign-in or /auth/sign-up
- THEN PublicAuthRoute redirects to /app

## RENAMED Requirements

### Requirement: Zustand Session Store → React Query Session + Zustand Status (REQ-AUTH-001)

(Migration: tests and docs referencing `useAuthStore` MUST update to `useSession()` or `useAuthStatus()`.)
