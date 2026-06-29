# auth-client (NEW)

| REQ ID | Requirement | Type |
|--------|-------------|------|
| REQ-AUTH-001 | Zustand store: `user`, `status` (unknown/loading/authenticated/unauthenticated). No session token in JS - httpOnly cookies only. | ADDED |
| REQ-AUTH-002 | AuthProvider MUST call GET /api/auth/me on mount. On 200→authenticated with user. On 401→unauthenticated. | ADDED |
| REQ-AUTH-003 | Login: POST /api/auth/login → Set-Cookie → status→authenticated. Register: POST /api/auth/register → same. | ADDED |
| REQ-AUTH-004 | Logout: POST /api/auth/logout → clear store (status→unauthenticated, user→null). | ADDED |
| REQ-AUTH-005 | OAuth: redirect browser to GET /api/auth/oauth/google. Callback page calls GET /api/auth/me after backend redirect. | ADDED |
| REQ-AUTH-006 | ProtectedRoute redirects to /auth/sign-in when unauthenticated. PublicAuthRoute redirects to /app when authenticated. | ADDED |

### Scenario: Session restore
- GIVEN valid cookie → mount → status: unknown→loading→authenticated, user populated

### Scenario: Login/register
- GIVEN credentials → POST → 200+Set-Cookie → status authenticated

### Scenario: Guard redirect
- GIVEN unauthenticated → ProtectedRoute → /auth/sign-in
- GIVEN authenticated → PublicAuthRoute → /app
