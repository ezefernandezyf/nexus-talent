# History Specification

## Purpose

Define the requirements for the History feature shell, allowing users to view, manage, and delete their previously analyzed job descriptions in a UI styled after "The Precision Instrument."

## Requirements

### Requirement: History List Display (REQ-HIST-001)

The system MUST display a list of all previously saved job analyses. Data MUST be fetched from `/api/analyses` via `HttpAnalysisRepository` with pagination params. The localStorage branch is removed.

#### Scenario: Populated history
- GIVEN the user has saved analyses on the server
- WHEN the user navigates to the history view
- THEN the system MUST fetch from GET `/api/analyses?page=1&limit=20` and display cards sorted by most recent first
- AND each card MUST be styled using the `surface-container` background without heavy borders or dividers, separating items via white space or hover states.

### Requirement: History Card Data

The system MUST display key summary data on each history card.

#### Scenario: Viewing a history card
- GIVEN a saved analysis exists in the history
- WHEN the card is rendered in the list
- THEN it MUST display the job title or the first line of the original description if title is absent
- AND it MUST display the date the analysis was saved
- AND it MUST display a short text snippet of the executive summary
- AND it MUST display up to 5 top skills using "Tech Chip" styling (`surface_container_high` background, `label-sm` Space Grotesk typography).

### Requirement: Empty History State (REQ-HIST-002)

The system MUST provide clear feedback when no history exists. Emptiness is determined by the API response (`items.length === 0`), not by a localStorage check.

#### Scenario: No saved analyses
- GIVEN the API returns `{ items: [], total: 0 }`
- WHEN the user navigates to the history view
- THEN the system MUST display an empty state message formatted with ample negative space (1.5x padding)
- AND the system SHOULD provide a primary CTA with a linear gradient to navigate to the new analysis flow.

### Requirement: Loading State

The system MUST indicate when history data is being fetched.

#### Scenario: Fetching history
- GIVEN the history data is being retrieved from the repository
- WHEN the view mounts
- THEN the system MUST display a loading state (e.g., skeletons) adhering to the `surface_variant` layer without rigid structural box components.

### Requirement: Delete Analysis (REQ-HIST-003)

The system MUST allow users to delete a saved analysis from their history. Deletion MUST always use `HttpAnalysisRepository.delete()` (DELETE /api/analyses/:id). The localStorage fallback is removed.

#### Scenario: Deleting an analysis
- GIVEN any user viewing the history list
- WHEN the user triggers delete for a specific analysis
- THEN the system MUST call DELETE `/api/analyses/:id` and remove the card from UI

#### Scenario: Deleting an analysis successfully
- GIVEN the user is viewing the history list
- WHEN the user triggers the delete action for a specific analysis card
- THEN the system MUST remove the analysis from the repository
- AND the system MUST remove the card from the UI
- AND the system MUST NOT use 1px solid borders during the list re-render (maintaining the "No-Line" rule).

#### Scenario: Deleting the last analysis
- GIVEN the user has exactly one saved analysis
- WHEN the user deletes that analysis
- THEN the system MUST seamlessly transition to the Empty History State.

### Requirement: UI behavior unchanged (REQ-HIST-011)

Existing UI components (HistoryFeature, HistoryCard) MUST work without code changes. The repository swap MUST be transparent to the UI layer.

#### Scenario: HistoryFeature renders with HTTP repository
- GIVEN the repository is `HttpAnalysisRepository`
- WHEN HistoryFeature mounts
- THEN it MUST render the same UI as with `LocalAnalysisRepository`

### Requirement: Server-Side Pagination (REQ-HIST-009)

History list MUST GET /api/analyses with `page` (1-indexed) and `limit` (default 20) query parameters.

#### Scenario: Paginated fetch
- GIVEN the user navigates to the history view
- WHEN the view mounts
- THEN GET /api/analyses?page=1&limit=20 is called
- AND the response contains `{ items, total, page, pageSize }`

#### Scenario: Next page
- GIVEN the user is on page 1 and there are more items
- WHEN the user clicks "Next"
- THEN GET /api/analyses?page=2&limit=20 is called
- AND the UI renders the next page of results

### Requirement: Backend-Handled Sorting/Filtering (REQ-HIST-010)

Sorting and filtering MUST be handled by the backend. The frontend MUST NOT sort or filter data client-side (defensive sorts that do not alter the rendered output are acceptable but not required).

#### Scenario: Server-driven sort
- GIVEN the API returns items sorted by `createdAt DESC`
- WHEN the history view renders
- THEN items appear in the order returned by the server
- AND no client-side sort function reorders the list

### Requirement: Existing history tests pass (REQ-HIST-012)

Existing history test suite MUST pass with the HTTP repository implementation.

#### Scenario: Test suite compatibility
- GIVEN the `HttpAnalysisRepository` is injected
- WHEN the existing history tests run
- THEN all tests MUST pass with the new data source
