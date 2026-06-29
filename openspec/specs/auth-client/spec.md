# Auth Client Specification

## Purpose

Defines the behavior for the auth client on the frontend - Zustand-based session management that replaces the Supabase Auth SDK. Session is driven by httpOnly JWT cookies via backend HTTP APIs.

## Requirements

### Requirement: Zustand Session Store (REQ-AUTH-001)

The frontend MUST maintain a Zustand store for auth state with `user`, `status` (unknown/loading/authenticated/unauthenticated). No session token MAY exist in JavaScript - httpOnly cookies only.

#### Scenario: Session restore
- GIVEN a valid httpOnly JWT cookie
- WHEN the app mounts
- THEN `restoreSession()` calls GET /api/auth/me
- AND the store transitions status: unknown → loading → authenticated
- AND `user` is populated from the response

### Requirement: Session Hydration on Mount (REQ-AUTH-002)

The AuthProvider MUST call GET /api/auth/me on mount. On 200→authenticated with user. On 401→unauthenticated.

#### Scenario: Valid session
- GIVEN a valid cookie
- WHEN AuthProvider mounts
- THEN GET /api/auth/me returns 200 with user payload
- AND status becomes authenticated

#### Scenario: No session
- GIVEN no cookie or expired cookie
- WHEN AuthProvider mounts
- THEN GET /api/auth/me returns 401
- AND status becomes unauthenticated

### Requirement: Login and Register (REQ-AUTH-003)

Login MUST POST /api/auth/login → Set-Cookie → status→authenticated. Register MUST POST /api/auth/register → same.

#### Scenario: Login/register
- GIVEN valid credentials
- WHEN POST /api/auth/login or POST /api/auth/register
- THEN backend responds 200 with Set-Cookie header
- AND store status transitions to authenticated

### Requirement: Logout (REQ-AUTH-004)

Logout MUST POST /api/auth/logout → clear store (status→unauthenticated, user→null).

#### Scenario: Logout
- GIVEN an authenticated session
- WHEN logout() is called
- THEN POST /api/auth/logout clears the cookie
- AND store is reset to unauthenticated with null user

### Requirement: OAuth Flow (REQ-AUTH-005)

OAuth MUST redirect the browser to GET /api/auth/oauth/google. The callback page MUST call GET /api/auth/me after backend redirect.

#### Scenario: OAuth sign-in
- GIVEN the user clicks "Sign in with Google"
- WHEN the OAuth action is triggered
- THEN the browser redirects to GET /api/auth/oauth/google
- AND after backend consent and redirect, the callback page calls restoreSession()
- AND the user becomes authenticated

### Requirement: Guard Redirects (REQ-AUTH-006)

ProtectedRoute MUST redirect to /auth/sign-in when unauthenticated. PublicAuthRoute MUST redirect to /app when authenticated.

#### Scenario: Protected route redirect
- GIVEN the user is unauthenticated
- WHEN navigating to any /app/* route
- THEN ProtectedRoute redirects to /auth/sign-in

#### Scenario: Public route redirect
- GIVEN the user is authenticated
- WHEN navigating to /auth/sign-in or /auth/sign-up
- THEN PublicAuthRoute redirects to /app
