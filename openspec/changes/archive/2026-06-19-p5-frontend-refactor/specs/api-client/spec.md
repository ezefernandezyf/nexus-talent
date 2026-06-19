# api-client (NEW)

| REQ ID | Requirement | Type |
|--------|-------------|------|
| REQ-API-001 | Axios instance: `baseURL: "/api"`, `withCredentials: true`. Replaces all raw `fetch()` calls. | ADDED |
| REQ-API-002 | 401 response interceptor MUST clear auth store and redirect to /auth/sign-in. | ADDED |
| REQ-API-003 | Responses MUST be typed via shared Zod contracts — never `any`. | ADDED |

### Scenario: Cookie sent
- GIVEN withCredentials:true → any /api/* request attaches httpOnly JWT cookie

### Scenario: 401 = logout
- GIVEN expired/missing cookie → 401 → interceptor clears store + redirects

### Scenario: Typed response
- GIVEN GET /api/auth/me → response typed as Zod-inferred MeResponse

> Vite proxies `/api` → `localhost:3001`. Settings/profile repos keep Supabase until V1.2.1.
