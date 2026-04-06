# Delta for Analysis

## ADDED Requirements

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