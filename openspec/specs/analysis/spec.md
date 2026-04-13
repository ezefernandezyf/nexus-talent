# Analysis Specification

## Purpose
Define the first user-facing capability of Nexus Talent: turn a pasted job description into structured analysis that the user can act on immediately.

## Requirements

### Requirement: Accept raw job description input
The system MUST allow the user to paste or type a raw job description as free text and MUST validate that the input is non-empty before analysis.

#### Scenario: Valid input
- GIVEN a user pastes a non-empty job description
- WHEN they submit the analysis form
- THEN the system accepts the input and starts the analysis flow

#### Scenario: Empty input
- GIVEN a user submits an empty text area
- WHEN the form is validated
- THEN the system MUST block submission and show a clear validation error

### Requirement: Optional GitHub repository URL input
The system MUST expose an optional GitHub repository URL input in the analysis form.

#### Scenario: User provides a GitHub URL
- GIVEN a valid job description and a valid GitHub repository URL
- WHEN the user fills the analysis form
- THEN the form MUST accept the URL as optional input
- AND the analysis request MUST be able to use it for enrichment.

#### Scenario: User leaves the GitHub URL blank
- GIVEN a valid job description and no GitHub repository URL
- WHEN the user submits the analysis form
- THEN the system MUST still accept the submission
- AND the base analysis result MUST remain available.

### Requirement: Produce structured analysis output
The system MUST return a structured result containing a job summary, a list of key skills, and a suggested outreach message that the user can edit before copying.

#### Scenario: Successful analysis
- GIVEN a valid job description
- WHEN the AI response is accepted by validation
- THEN the UI MUST render the summary, skills matrix, and an editable outreach message

#### Scenario: Edit outreach before copy
- GIVEN a valid analysis result on screen
- WHEN the user edits the outreach message
- THEN the copied text MUST reflect the edited version

#### Scenario: Invalid AI response
- GIVEN the AI returns malformed or incomplete data
- WHEN validation fails
- THEN the system MUST NOT crash and MUST show a user-friendly error state

### Requirement: Expose analysis loading and failure states
The system MUST show explicit loading, success, and error states while the analysis is running.

#### Scenario: Analysis in progress
- GIVEN the user has submitted a valid job description
- WHEN the request is pending
- THEN the UI MUST show a loading state with visible feedback

#### Scenario: Analysis failure
- GIVEN the request fails due to network or validation issues
- WHEN the failure is detected
- THEN the UI MUST show an actionable error state

### Requirement: Preserve quality targets for the module
The module MUST be designed so its critical logic can reach at least 90% test coverage and its user-facing screens SHOULD be compatible with 95+ Lighthouse targets.

#### Scenario: Coverage target met
- GIVEN the module tests are executed
- WHEN critical paths are measured
- THEN the test suite SHOULD cover at least 90% of the important logic

#### Scenario: Lighthouse target met
- GIVEN the module is built and audited
- WHEN Lighthouse runs on the main screens
- THEN the scores SHOULD target 95+ for the applicable categories

### Requirement: Outreach export actions
The system MUST allow the user to export the editable outreach message produced by the analysis result view through shareable and downloadable formats.

#### Scenario: Open a draft email
- GIVEN a valid analysis result is on screen
- WHEN the user chooses the email export action
- THEN the system MUST open a draft email flow populated with the current edited subject and body
- AND the clipboard copy behavior MUST remain available as a fallback.

#### Scenario: Download outreach as markdown or JSON
- GIVEN a valid analysis result is on screen
- WHEN the user chooses to export the outreach
- THEN the system MUST allow downloading the outreach content in a reusable format
- AND the exported content MUST reflect the latest edited subject and body.

#### Scenario: Export remains available when a browser blocks a share path
- GIVEN the user attempts an export in a browser that does not support the preferred handoff
- WHEN the export action cannot complete directly
- THEN the system MUST present a fallback path that still lets the user copy the outreach content
- AND the user MUST receive clear feedback that the export path was not completed.

### Requirement: Preserve existing clipboard copy behavior
The system MUST keep the current clipboard copy action working as the fallback path for outreach sharing.

#### Scenario: Clipboard copy still works after export actions are added
- GIVEN a valid analysis result with edited outreach content
- WHEN the user clicks the copy action
- THEN the system MUST copy the latest edited subject and body to the clipboard
- AND the new export actions MUST not break the existing copy feedback state.

### Requirement: Optional GitHub enrichment input
The system MUST allow the user to optionally provide a GitHub repository URL during analysis and SHOULD use it to enrich the result when present.

#### Scenario: Analyze with a GitHub URL
- GIVEN a valid job description and a valid GitHub repository URL
- WHEN the user submits the analysis request
- THEN the system MUST accept both inputs
- AND the analysis flow MUST be able to use the GitHub URL for enrichment.

#### Scenario: Analyze without a GitHub URL
- GIVEN a valid job description and no GitHub URL
- WHEN the user submits the analysis request
- THEN the system MUST still produce the standard analysis result
- AND the result MUST not depend on GitHub data.

### Requirement: Surface detected GitHub stack
The system MUST display GitHub-derived stack signals in the analysis result when enrichment succeeds.

#### Scenario: Enrichment succeeds
- GIVEN a valid job description and a readable GitHub repository URL
- WHEN the analysis request completes successfully
- THEN the system MUST show the detected stack in the result
- AND the base analysis summary MUST remain visible.

#### Scenario: No stack signals are found
- GIVEN a valid job description and a GitHub repository URL with no useful stack signals
- WHEN the analysis request completes
- THEN the system SHOULD still render the base analysis result
- AND the system MUST avoid showing misleading stack data.

### Requirement: Preserve core analysis when GitHub fails
The system MUST keep the job-analysis result available even if GitHub enrichment fails or cannot be completed.

#### Scenario: GitHub request fails
- GIVEN a valid job description and a GitHub repository URL
- WHEN the GitHub enrichment request fails
- THEN the system MUST still return the job-analysis result
- AND the user MUST receive a clear, non-blocking warning.

#### Scenario: GitHub data is unavailable
- GIVEN a valid job description and an inaccessible GitHub repository URL
- WHEN the analysis request completes
- THEN the system MUST still render the base result
- AND the system MUST not crash.
