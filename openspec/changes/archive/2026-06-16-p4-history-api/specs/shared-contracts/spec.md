# Delta for Shared Contracts

## ADDED Requirements

### Requirement: Analysis update schema (REQ-HIST-010)

`analysisUpdateSchema` MUST validate PATCH `/api/analyses/:id` body with optional `displayName` (string, 1-200 chars) and `notes` (string, 0-5000 chars). At least one field MUST be present.

#### Scenario: Valid partial update
- GIVEN `{ displayName: "Senior Eng Role" }`
- WHEN validated against `analysisUpdateSchema`
- THEN parse succeeds

#### Scenario: Empty body rejected
- GIVEN `{}`
- WHEN validated against `analysisUpdateSchema`
- THEN parse fails with Zod error

#### Scenario: Invalid field rejected
- GIVEN `{ invalidField: true }`
- WHEN validated against `analysisUpdateSchema` (strict)
- THEN parse fails with Zod error
