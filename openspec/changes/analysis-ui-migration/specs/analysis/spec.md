# Delta for Analysis

## ADDED Requirements

### Requirement: Reference-aligned analysis page shell
The system MUST render the analysis page with the Stitch reference hierarchy: intro copy, form surface, result surface, and supporting cards.

#### Scenario: Initial analysis page render
- GIVEN the user opens the analysis page
- WHEN the page loads
- THEN the heading, helper copy, form, and supporting panels MUST appear in the reference order
- AND the analysis feature MUST remain reachable without navigating away.

### Requirement: Reference-aligned analysis form
The system MUST present the job description form, tone selector, and optional GitHub URL input with the reference spacing and grouping.

#### Scenario: User fills the form
- GIVEN the analysis form is visible
- WHEN the user enters a description and optional GitHub URL
- THEN the inputs MUST remain editable and the submit action MUST stay available
- AND empty submission MUST still be blocked.

### Requirement: Reference-aligned result view
The system MUST render analysis results with the reference card hierarchy for summary, skill groups, GitHub enrichment, and outreach editing/export actions.

#### Scenario: Analysis succeeds
- GIVEN a valid analysis result
- WHEN the result view renders
- THEN the summary, skill groups, enrichment section, and outreach editor MUST be visible
- AND the latest edited outreach MUST remain the source for copy and export actions.

### Requirement: Visible loading, empty, and error states
The system MUST display explicit loading, empty, and error states in the analysis feature using the reference surfaces and copy.

#### Scenario: Analysis is pending
- GIVEN the user has submitted a valid analysis request
- WHEN the request is in flight
- THEN the loading state MUST be visible and the form MUST remain contextual
- AND the page layout MUST not collapse.

#### Scenario: Analysis fails or is empty
- GIVEN the analysis fails or no result is available yet
- WHEN the feature renders the fallback state
- THEN the empty or error state MUST be visible
- AND the page MUST still preserve the analysis shell and spacing.
