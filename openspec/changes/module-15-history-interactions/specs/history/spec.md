# Delta for History

## Exclusions
This change does not redesign the history list, change export behavior, modify shell/navigation, or implement real pagination. The existing pagination controls remain cosmetic only.

## ADDED Requirements

### Requirement: Persisted History Detail Edits
The system MUST allow a user to edit and persist the saved analysis detail fields exposed on the history detail surface, including rename and notes fields or their current equivalent.

#### Scenario: Edit is saved successfully
- GIVEN a saved analysis detail is loaded
- WHEN the user changes the editable fields and saves
- THEN the updated values MUST persist for that analysis
- AND reopening the detail surface MUST show the saved values

#### Scenario: Empty edits are rejected
- GIVEN the user clears a required editable field
- WHEN the user attempts to save
- THEN the system MUST block the save
- AND the current saved analysis MUST remain unchanged

### Requirement: History Detail Surface States
The history detail surface MUST handle loaded, not-found, save-success, and save-failure states without breaking the route.

#### Scenario: Detail loads
- GIVEN a valid saved analysis exists
- WHEN the user opens its detail route
- THEN the detail surface MUST render the saved analysis data
- AND the user MUST be able to review the current values before editing

#### Scenario: Analysis is not found
- GIVEN the requested analysis does not exist
- WHEN the detail route resolves
- THEN the system MUST show a not-found state
- AND the user MUST NOT see editable controls for missing data

#### Scenario: Save succeeds
- GIVEN the user saves valid detail edits
- WHEN the repository confirms the write
- THEN the system MUST show success feedback
- AND the saved values MUST remain visible on the detail surface

#### Scenario: Save fails
- GIVEN the user attempts to save valid edits
- WHEN the write fails
- THEN the system MUST show an error state or message
- AND the unsaved input MUST remain visible so the user can retry

### Requirement: Match Score Remains Derived UI Only
The score chip MUST remain derived UI only. The system MUST NOT persist a match score field, and `matchIndex` MUST NOT return as persisted data.

#### Scenario: Score is rendered
- GIVEN a history item has analysis data
- WHEN the detail surface renders
- THEN the score chip MUST display the computed score from current UI data
- AND no persisted score field is required

#### Scenario: Persisted data is saved
- GIVEN the user saves detail edits
- WHEN persistence completes
- THEN the stored record MUST NOT add `matchIndex`
- AND the next load MUST continue to compute the score in the UI

## Acceptance Criteria
- The detail surface supports persisted rename and notes edits.
- Loaded, not-found, save-success, and save-failure states are explicitly handled.
- List redesign, export, shell changes, and real pagination stay out of scope.
- The score chip continues to be derived UI only, with no persisted `matchIndex`.