# profile-fields Specification

## Purpose

Enriched user profile with professional identity fields for personalized AI analysis.

## Requirements

### Requirement: Extended profile fields

The Profile model MUST include 7 new nullable fields alongside existing `id`, `email`, `displayName`.

| ID | Field | Type | Validation |
|----|-------|------|------------|
| REQ-PF-001 | `skills` | `String?` | Non-empty when provided |
| REQ-PF-002 | `experienceLevel` | `String?` | Free text |
| REQ-PF-003 | `roleTitle` | `String?` | Free text |
| REQ-PF-004 | `resumeLink` | `String?` | Valid URL |
| REQ-PF-005 | `linkedinUrl` | `String?` | Valid URL |
| REQ-PF-006 | `githubUrl` | `String?` | Valid URL |
| REQ-PF-007 | `location` | `String?` | Free text |

#### Scenario: Full profile update
- GIVEN a user with existing profile
- WHEN PUT `/api/profile` with all 7 fields populated and valid
- THEN 200 with all fields returned; DB row updated

#### Scenario: Partial update (skills only)
- GIVEN a user with existing profile
- WHEN PUT `/api/profile` with only `{ skills: "React, TypeScript" }`
- THEN 200 with skills populated; other 6 fields remain null

#### Scenario: Invalid URL rejected
- GIVEN a user submitting `{ linkedinUrl: "not-a-url" }`
- WHEN PUT `/api/profile`
- THEN 400 with Zod validation error

### Requirement: Zod-validated PUT endpoint

PUT `/api/profile` MUST use `profileUpdateSchema` (shared Zod) instead of inline `typeof` checks. GET `/api/profile` MUST return all 10 fields (3 existing + 7 new).

#### Scenario: Zod replaces inline check
- GIVEN the profile router currently uses `typeof displayName !== "string"` inline
- WHEN P14 is implemented
- THEN the router MUST call `profileUpdateSchema.parse(req.body)` from `@nexus-talent/shared`

#### Scenario: GET returns all fields
- GIVEN a profile with `skills: "Python"` and no other new fields set
- WHEN GET `/api/profile`
- THEN response includes `{ skills: "Python", experienceLevel: null, roleTitle: null, ... }`
