# Delta Specs — P15 Settings Backend

---

# 1. user-settings (NEW)

## user-settings Specification

### Requirement: User Settings CRUD

| ID | Requirement |
|----|-------------|
| REQ-US-001 | GET /api/settings MUST return settings. No row → auto-create defaults (theme=light, emailDigest=true, rateLimitTier=default). |
| REQ-US-002 | PUT /api/settings MUST upsert via Zod: theme ∈ {light,dark}, emailDigest boolean, rateLimitTier ∈ {default,relaxed,strict}. |
| REQ-US-003 | Unauthenticated requests MUST return 401. |

#### Scenario: Auto-create defaults on first GET
- GIVEN authenticated user, no UserSettings row
- WHEN GET /api/settings
- THEN row created with defaults, 200

#### Scenario: Partial update preserves unchanged fields
- GIVEN `{ theme: "light", emailDigest: true }`
- WHEN PUT `{ theme: "dark" }`
- THEN 200, emailDigest preserved

#### Scenario: Invalid enum rejected
- GIVEN authenticated user
- WHEN PUT `{ theme: "neon" }`
- THEN 400 with Zod error

---

# 2. oauth-linking (NEW)

## oauth-linking Specification

### Requirement: OAuth Link and Unlink

| ID | Requirement |
|----|-------------|
| REQ-OL-001 | GET /api/auth/oauth/google?link=true MUST initiate linking (401 without session). |
| REQ-OL-002 | Linking callback MUST call linkIdentity() to set Profile.googleId. |
| REQ-OL-003 | DELETE /api/auth/oauth/google MUST clear googleId (200 idempotent). |

#### Scenario: Link flow succeeds
- GIVEN valid session
- WHEN ?link=true → Google auth → callback
- THEN Profile.googleId set, redirect with one-time code

#### Scenario: Link rejected without session
- GIVEN no session
- WHEN GET ...?link=true
- THEN 401

#### Scenario: Unlink clears googleId
- GIVEN valid session, googleId = "abc123"
- WHEN DELETE /api/auth/oauth/google
- THEN googleId = null, 200

---

# 3. auth (MODIFIED)

## Delta for auth

## ADDED Requirements

### Requirement: OAuth Linking Mode on Callback

Callback MUST detect linking mode from anti-CSRF state. Link mode → linkIdentity(). Otherwise → findOrCreateGoogleUser().

#### Scenario: Link callback updates Profile
- GIVEN state has link=true, valid session
- WHEN callback exchanges Google code
- THEN linkIdentity() updates Profile.googleId

#### Scenario: Non-link mode unchanged
- GIVEN state without link=true
- WHEN callback executes
- THEN findOrCreateGoogleUser() used (existing)

## MODIFIED Requirements

### Requirement: OAuth Initiation Accepts link Parameter

GET /api/auth/oauth/google MUST accept optional ?link=true. Present → middleware requires session (401 without). Absent → existing flow unchanged.

#### Scenario: Link with session passes
- GIVEN valid session
- WHEN GET ...?link=true
- THEN middleware passes, link in OAuth state

#### Scenario: Link without session blocked
- GIVEN no session
- WHEN GET ...?link=true
- THEN 401

#### Scenario: Normal login unchanged
- GIVEN no session
- WHEN GET /api/auth/oauth/google
- THEN existing OAuth login, no session required

---

# 4. ai-proxy (MODIFIED)

## Delta for ai-proxy

## MODIFIED Requirements

### Requirement: POST /api/ai/analyze endpoint

POST /api/ai/analyze MUST accept validated body.

| ID | Requirement |
|----|-------------|
| REQ-AI-001 | Accept validated body |
| REQ-AI-002 | Call Groq with env key |
| REQ-AI-003 | Validate response via schema |
| REQ-AI-004 | Per-user limit when auth'd: 30|60|10/min. Fallback IP 20/60s. |
| REQ-AI-005 | Return 400/429/502 |
| REQ-AI-006 | Enforce 30s timeout |
| REQ-HIST-009 | Persist result best-effort; save failure no-op |

(Previously: REQ-AI-004 was fixed 20/60s IP-only.)

#### Scenario: Relaxed tier
- GIVEN auth'd, rateLimitTier = "relaxed"
- WHEN 61st request in one minute
- THEN 429

#### Scenario: No UserSettings or unauthenticated → IP limit
- GIVEN no UserSettings row or no session
- WHEN 21st request from IP in 60s
- THEN 429

#### Scenario: Valid input → 200
- GIVEN valid jobDescription
- WHEN POST /api/ai/analyze
- THEN 200

#### Scenario: Invalid input → 400
- GIVEN empty jobDescription
- WHEN POST /api/ai/analyze
- THEN 400

#### Scenario: Key missing → 502
- GIVEN GROQ_API_KEY unset
- WHEN valid request
- THEN 502

#### Scenario: Timeout → 502
- GIVEN Groq > 30s
- WHEN timeout fires
- THEN 502
