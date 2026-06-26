# Delta for Persistence

## MODIFIED Requirements

### Requirement: Repository Interface Contract

The system MUST define an abstract `AnalysisRepository` interface to decouple the UI from the storage mechanism. The interface MUST include an `update` method for partial field mutation.

#### Scenario: Local-First Implementation
- GIVEN the `AnalysisRepository` interface
- WHEN the application interacts with historical data
- THEN it MUST use `save`, `getAll`, `getById`, `delete`, and `update` methods
- AND concrete implementations MUST satisfy all methods

(Previously: interface had save, getAll, getById, delete — no update method.)

## ADDED Requirements

### Requirement: HttpAnalysisRepository (REQ-HIST-006)

`HttpAnalysisRepository` MUST implement `AnalysisRepository` by calling `/api/analyses` endpoints with credentials. All methods MUST handle HTTP errors and return domain types matching the interface contract.

#### Scenario: getAll fetches all analyses
- GIVEN an authenticated user
- WHEN `getAll()` is called
- THEN it MUST GET `/api/analyses` with credentials and return `SavedJobAnalysis[]`

#### Scenario: update sends PATCH
- GIVEN an authenticated user and an analysis ID
- WHEN `update(id, { displayName, notes })` is called
- THEN it MUST PATCH `/api/analyses/:id` and return updated `SavedJobAnalysis`

#### Scenario: HTTP error propagation
- GIVEN an HTTP call returns 401, 404, or 5xx
- WHEN the repository method receives the error
- THEN it MUST throw a typed error the UI can surface

### Requirement: Repository injection by auth status (REQ-HIST-007)

`useAnalysisRepository` MUST select `HttpAnalysisRepository` when authenticated and `LocalAnalysisRepository` when anonymous.

#### Scenario: Authenticated user
- GIVEN auth state is "authenticated"
- WHEN the hook resolves the repository
- THEN it MUST return `HttpAnalysisRepository`

#### Scenario: Anonymous user
- GIVEN auth state is "unauthenticated"
- WHEN the hook resolves the repository
- THEN it MUST return `LocalAnalysisRepository`

### Requirement: HTTP-backed mutations (REQ-HIST-008)

Frontend delete and update operations MUST use HTTP when the user is authenticated.

#### Scenario: Delete via HTTP
- GIVEN an authenticated user
- WHEN a delete action is triggered
- THEN the repository MUST call DELETE `/api/analyses/:id` (not localStorage)

#### Scenario: Update via HTTP
- GIVEN an authenticated user
- WHEN an update action is triggered
- THEN the repository MUST call PATCH `/api/analyses/:id` (not localStorage)
