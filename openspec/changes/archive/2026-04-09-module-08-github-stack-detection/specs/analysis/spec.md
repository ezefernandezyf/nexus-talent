# Delta for Analysis

## ADDED Requirements

### Requirement: Optional GitHub repository URL input
The system MUST expose an optional GitHub repository URL input in the analysis form.

#### Scenario: User submits analysis with a GitHub URL
- GIVEN a valid job description and a valid GitHub repository URL
- WHEN the user submits the analysis form
- THEN the request MUST include both the job description and the URL
- AND the enrichment flow MUST remain optional.

#### Scenario: User submits analysis without a GitHub URL
- GIVEN a valid job description and no GitHub repository URL
- WHEN the user submits the analysis form
- THEN the request MUST still be accepted
- AND the base analysis result MUST remain available.

### Requirement: Keep GitHub enrichment non-blocking
The system MUST preserve the base analysis result even when GitHub enrichment cannot be completed.

#### Scenario: GitHub lookup fails
- GIVEN a valid job description and a GitHub repository URL
- WHEN the GitHub lookup fails or returns unusable data
- THEN the system MUST still render the analysis result
- AND the user MUST see a clear warning instead of a crash.

#### Scenario: GitHub stack signals are absent
- GIVEN a valid job description and a readable GitHub repository URL with no useful signals
- WHEN the analysis completes
- THEN the system SHOULD still show the base result
- AND it MUST avoid presenting misleading stack data.