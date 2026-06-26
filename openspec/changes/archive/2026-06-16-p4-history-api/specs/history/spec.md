# Delta for History

## MODIFIED Requirements

### Requirement: History List Display

The system MUST display a list of all previously saved job analyses. For authenticated users, data MUST be fetched from `/api/analyses` via `HttpAnalysisRepository`. For anonymous users, data MUST come from `localStorage` via `LocalAnalysisRepository`.

(Previously: data source was exclusively localStorage for all users.)

#### Scenario: Populated history (authenticated)
- GIVEN the user is authenticated and has saved analyses on the server
- WHEN the user navigates to the history view
- THEN the system MUST fetch from GET `/api/analyses` and display cards sorted by most recent first

#### Scenario: Populated history (anonymous)
- GIVEN the user is not authenticated and has localStorage analyses
- WHEN the user navigates to the history view
- THEN the system MUST read from `LocalAnalysisRepository` and display cards sorted by most recent first

### Requirement: Delete Analysis

The system MUST allow users to delete a saved analysis. For authenticated users, deletion MUST use `HttpAnalysisRepository.delete()`. For anonymous users, deletion MUST use `LocalAnalysisRepository.delete()`.

(Previously: deletion was always localStorage-based.)

#### Scenario: Deleting an analysis (authenticated)
- GIVEN an authenticated user viewing the history list
- WHEN the user triggers delete for a specific analysis
- THEN the system MUST call DELETE `/api/analyses/:id` and remove the card from UI

## ADDED Requirements

### Requirement: UI behavior unchanged (REQ-HIST-011)

Existing UI components (HistoryFeature, HistoryCard) MUST work without code changes. The repository swap MUST be transparent to the UI layer.

#### Scenario: HistoryFeature renders with HTTP repository
- GIVEN the repository is `HttpAnalysisRepository`
- WHEN HistoryFeature mounts
- THEN it MUST render the same UI as with `LocalAnalysisRepository`

### Requirement: Existing history tests pass (REQ-HIST-012)

Existing history test suite MUST pass with the HTTP repository implementation.

#### Scenario: Test suite compatibility
- GIVEN the `HttpAnalysisRepository` is injected
- WHEN the existing history tests run
- THEN all tests MUST pass with the new data source
