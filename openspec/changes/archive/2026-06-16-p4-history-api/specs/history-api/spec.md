# History API Specification

## Purpose

REST CRUD for user analyses under `/api/analyses`. All endpoints are scoped to `req.userId`.

## Requirements

### Requirement: List user analyses (REQ-HIST-001)

GET `/api/analyses` MUST return all analyses owned by the authenticated user.

#### Scenario: Authenticated user with analyses
- GIVEN an authenticated user with 3 saved analyses
- WHEN GET /api/analyses is called
- THEN response MUST be `{ items: Analysis[], total: 3 }` with status 200

#### Scenario: Authenticated user with no analyses
- GIVEN an authenticated user with no saved analyses
- WHEN GET /api/analyses is called
- THEN response MUST be `{ items: [], total: 0 }` with status 200

### Requirement: Get single analysis (REQ-HIST-002)

GET `/api/analyses/:id` MUST return the analysis if owned by the authenticated user, or 404 otherwise.

#### Scenario: Owned analysis found
- GIVEN an analysis owned by the authenticated user
- WHEN GET /api/analyses/:id is called
- THEN response MUST be the `Analysis` object with status 200

#### Scenario: Analysis not owned by user
- GIVEN an analysis owned by a different user
- WHEN GET /api/analyses/:id is called
- THEN response MUST be 404

### Requirement: Delete analysis (REQ-HIST-003)

DELETE `/api/analyses/:id` MUST remove the analysis if owned by the authenticated user, or 404 otherwise.

#### Scenario: Successful deletion
- GIVEN an analysis owned by the authenticated user
- WHEN DELETE /api/analyses/:id is called
- THEN response MUST be 204 and the record removed from DB

#### Scenario: Delete non-owned analysis
- GIVEN an analysis owned by a different user
- WHEN DELETE /api/analyses/:id is called
- THEN response MUST be 404

### Requirement: Update analysis fields (REQ-HIST-004)

PATCH `/api/analyses/:id` MUST accept a Zod-validated body with optional `displayName` and `notes` fields, update the owned analysis, and return the updated object.

#### Scenario: Update displayName
- GIVEN an owned analysis
- WHEN PATCH with `{ displayName: "Frontend Lead Role" }` is called
- THEN response MUST be the updated `Analysis` with status 200

#### Scenario: Invalid PATCH body
- GIVEN an owned analysis
- WHEN PATCH with `{ invalidField: true }` is called
- THEN response MUST be 400 with Zod error details

### Requirement: Auth rejection (REQ-HIST-005)

All `/api/analyses` endpoints MUST reject unauthenticated requests with 401.

#### Scenario: No auth cookie
- GIVEN a request without a valid JWT cookie
- WHEN any /api/analyses endpoint is called
- THEN response MUST be 401
