# Delta Specs — P17 CV Generator

---

# 1. cv-experience (NEW)

## cv-experience Specification

### Requirement: Work Experience CRUD

| ID | Requirement |
|----|-------------|
| REQ-WE-001 | GET /api/cv/experience MUST return authenticated user's entries, newest first. No rows → 200 + []. |
| REQ-WE-002 | POST /api/cv/experience MUST create entry. Body validated via Zod: company, role, startDate required; endDate, description, location optional. startDate/endDate as ISO date strings. endDate nullable = current position. |
| REQ-WE-003 | PUT /api/cv/experience/:id MUST update entry owned by authenticated user. 404 if not found or not owned. |
| REQ-WE-004 | DELETE /api/cv/experience/:id MUST remove entry owned by authenticated user. 204. 404 if not found or not owned. |
| REQ-WE-005 | All endpoints MUST require authentication. 401 without valid session. |

#### Scenario: List returns user's entries in order
- GIVEN authenticated user with 2 work entries (most recent: "Senior Dev" at "Acme", older: "Junior Dev" at "StartupCo")
- WHEN GET /api/cv/experience
- THEN 200, array with 2 entries, first is "Acme"

#### Scenario: Create with required fields only
- GIVEN authenticated user
- WHEN POST `{ company: "Nexus", role: "CTO", startDate: "2024-01-01" }`
- THEN 201, entry persisted with generated id

#### Scenario: Create rejected for missing required fields
- GIVEN authenticated user
- WHEN POST `{ company: "OnlyCo" }`  // no role or startDate
- THEN 400 with Zod validation error

#### Scenario: Update entry not owned returns 404
- GIVEN user A has entry id="abc", user B is authenticated
- WHEN PUT /api/cv/experience/abc with valid body
- THEN 404

#### Scenario: Unauthenticated returns 401
- GIVEN no session
- WHEN GET /api/cv/experience
- THEN 401

### Requirement: Education CRUD

| ID | Requirement |
|----|-------------|
| REQ-ED-001 | GET /api/cv/education MUST return authenticated user's entries, newest first. |
| REQ-ED-002 | POST /api/cv/education MUST create entry. Body validated via Zod: institution, degree, startDate required; field, endDate, description optional. |
| REQ-ED-003 | PUT /api/cv/education/:id MUST update entry owned by authenticated user. |
| REQ-ED-004 | DELETE /api/cv/education/:id MUST remove entry owned by authenticated user. 204. |
| REQ-ED-005 | All education endpoints MUST require authentication. |

#### Scenario: Create education entry with all fields
- GIVEN authenticated user
- WHEN POST `{ institution: "MIT", degree: "BSc CS", field: "AI", startDate: "2020-09-01", endDate: "2024-06-01" }`
- THEN 201, all fields persisted

#### Scenario: Delete entry not owned returns 404
- GIVEN user B authenticated, entry "xyz" owned by user A
- WHEN DELETE /api/cv/education/xyz
- THEN 404

---

# 2. cv-generator (NEW)

## cv-generator Specification

### Requirement: CV Generation via Groq

| ID | Requirement |
|----|-------------|
| REQ-CV-001 | POST /api/cv/generate MUST accept validated body: sectionOrder (string[], optional), adHocItems (array of {section, title, subtitle?, description?}, optional), jobDescription (string, optional, max 12000). |
| REQ-CV-002 | Server MUST merge persisted experience/education + profile data + adHocItems into a single structured prompt for Groq. AdHocItems MUST NOT be persisted. |
| REQ-CV-003 | Groq call MUST reuse fetchGroq() pattern from analysis service: structured prompt, response_format: json_object, 30s timeout. |
| REQ-CV-004 | Response MUST be validated against a Zod CV schema before returning. Invalid responses → 502 with "AI response validation failed". |
| REQ-CV-005 | Endpoint MUST require authentication. 401 without session. |
| REQ-CV-006 | Groq timeout or network error → 502. GROQ_API_KEY missing → 502. |
| REQ-CV-007 | If persisted experience list is empty, server MUST still proceed — Groq generates CV from profile + ad-hoc items only. |

#### Scenario: Full generation with all data sources
- GIVEN authenticated user with 2 experience entries, 1 education entry, profile skills="React, TypeScript"
- WHEN POST `{ sectionOrder: ["summary","experience","skills"], jobDescription: "Senior FE role", adHocItems: [{section:"projects", title:"Portfolio", description:"Built with Next.js"}] }`
- THEN 200, response includes summary/skills/experience/projects sections, ad-hoc project appears but NOT in GET /api/cv/experience

#### Scenario: Validates malformed Groq response
- GIVEN Groq returns JSON missing required `sections` field
- WHEN POST valid request
- THEN 502 with "AI response validation failed"

#### Scenario: Groq timeout
- GIVEN Groq takes > 30s
- WHEN POST valid request
- THEN 502

#### Scenario: Empty input → proceeds
- GIVEN authenticated user with no experience, no education, empty profile skills
- WHEN POST `{}` (empty body)
- THEN 200, Groq generates CV sections from available context (profile defaults, no experience listed)

#### Scenario: Invalid jobDescription rejected
- GIVEN authenticated user
- WHEN POST `{ jobDescription: "" }` // empty string
- THEN 400 with Zod validation error

### Requirement: CV Response Structure

| ID | Requirement |
|----|-------------|
| REQ-CV-R01 | Response MUST include `sections`: array of `{ heading, body }` objects, ordered per sectionOrder or AI-default order. |
| REQ-CV-R02 | `heading` MUST be a non-empty string (e.g. "Professional Summary"). |
| REQ-CV-R03 | `body` MUST be a non-empty Markdown string. |
| REQ-CV-R04 | Response MUST include `metadata`: `{ generatedAt: ISO string, sectionsIncluded: string[] }`. |

#### Scenario: Valid response matches schema
- GIVEN Groq returns `{ sections: [{heading:"Summary", body:"Experienced engineer..."}, {heading:"Skills", body:"- React\n- TypeScript"}], metadata: {generatedAt:"...", sectionsIncluded:["summary","skills"]} }`
- WHEN Zod validation runs
- THEN passes, 200 returned to client

#### Scenario: Response with empty heading rejected
- GIVEN Groq returns `{ sections: [{heading:"", body:"content"}], metadata: {...} }`
- WHEN Zod validation runs
- THEN fails, 502 returned
