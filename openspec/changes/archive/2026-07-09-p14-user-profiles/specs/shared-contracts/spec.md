# Delta for shared-contracts

## ADDED Requirements

### Requirement: profileSchema (extended)

`profileSchema` MUST include all 10 fields: `id`, `email`, `displayName` (existing) plus `skills`, `experienceLevel`, `roleTitle`, `resumeLink`, `linkedinUrl`, `githubUrl`, `location` (all `z.string().nullable()`).

| ID | Field | Zod |
|----|-------|-----|
| REQ-SC-P01 | `skills` | `z.string().nullable()` |
| REQ-SC-P02 | `experienceLevel` | `z.string().nullable()` |
| REQ-SC-P03 | `roleTitle` | `z.string().nullable()` |
| REQ-SC-P04 | `resumeLink` | `z.string().url().nullable().or(z.literal(""))` |
| REQ-SC-P05 | `linkedinUrl` | `z.string().url().nullable().or(z.literal(""))` |
| REQ-SC-P06 | `githubUrl` | `z.string().url().nullable().or(z.literal(""))` |
| REQ-SC-P07 | `location` | `z.string().nullable()` |

#### Scenario: Full profile validated
- GIVEN a response with all 10 fields populated
- WHEN validated against `profileSchema`
- THEN `parse()` succeeds

#### Scenario: Null fields accepted
- GIVEN a response where only `id`, `email` are set; all 7 new fields are `null`
- WHEN validated against `profileSchema`
- THEN `parse()` succeeds

### Requirement: profileUpdateSchema

`profileUpdateSchema` MUST validate the PUT `/api/profile` body. All fields MUST be optional. URL fields MUST be valid URLs when non-empty. Text fields (skills, experienceLevel, roleTitle, displayName, location) MUST transform empty strings (`""`) to `undefined` so the server writes `NULL` — this gracefully handles cleared form inputs instead of rejecting them.

#### Scenario: All fields optional
- GIVEN `{}`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds — all fields are optional

#### Scenario: Valid update
- GIVEN `{ skills: "React, TypeScript", experienceLevel: "Senior 10+", linkedinUrl: "https://linkedin.com/in/user" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds

#### Scenario: Invalid URL
- GIVEN `{ linkedinUrl: "not-a-url" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` fails with Zod error

#### Scenario: Empty skills gracefully transformed
- GIVEN `{ skills: "" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds with `skills: undefined` — the empty string is transformed instead of rejected, so clearing the skills field in the UI saves as NULL
