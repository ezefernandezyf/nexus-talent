# History Specification

## Purpose

Define the requirements for the History feature shell, allowing users to view, manage, and delete their previously analyzed job descriptions in a UI styled after "The Precision Instrument."

## Requirements

### Requirement: History List Display

The system MUST display a list of all previously saved job analyses.

#### Scenario: Populated history
- GIVEN the user has previously saved analyses
- WHEN the user navigates to the history view
- THEN the system MUST display a list of analysis cards sorted by most recent first
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

### Requirement: Empty History State

The system MUST provide clear feedback when no history exists.

#### Scenario: No saved analyses
- GIVEN the user has no saved analyses
- WHEN the user navigates to the history view
- THEN the system MUST display an empty state message formatted with ample negative space (1.5x padding)
- AND the system SHOULD provide a primary CTA with a linear gradient to navigate to the new analysis flow.

### Requirement: Loading State

The system MUST indicate when history data is being fetched.

#### Scenario: Fetching history
- GIVEN the history data is being retrieved from the repository
- WHEN the view mounts
- THEN the system MUST display a loading state (e.g., skeletons) adhering to the `surface_variant` layer without rigid structural box components.

### Requirement: Delete Analysis

The system MUST allow users to delete a saved analysis from their history.

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
