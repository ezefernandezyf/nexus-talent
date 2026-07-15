# Delta for Analysis

## MODIFIED Requirements

### Requirement: Accept job description via parent props
The system MUST receive the job description and tone as props from UnifiedPage rather than owning its own input form. AnalysisFeature MUST NOT render a JD textarea or submit button.

(Previously: AnalysisPage owned its own JD textarea form with client-side validation and a submit button.)

#### Scenario: Props-driven analysis
- GIVEN UnifiedPage has JD ≥30 chars in state
- WHEN GENERATE triggers analysis API call
- THEN AnalysisFeature receives `jd` and `tone` as props and passes them to the API

#### Scenario: No standalone form
- GIVEN AnalysisFeature renders inside UnifiedPage
- WHEN component mounts
- THEN no JD textarea, GitHub URL input, or submit button is rendered

### Requirement: Receive GitHub URL as optional prop
The system MUST accept an optional GitHub repository URL as a prop from the parent (UnifiedPage) or shared config. The URL input moves to the unified config panel.

(Previously: GitHub URL input was rendered inside AnalysisPage's own form.)

#### Scenario: GitHub URL provided via props
- GIVEN unified config has a GitHub URL
- WHEN analysis API is called
- THEN the URL is forwarded to the enrichment endpoint

#### Scenario: GitHub URL absent
- GIVEN unified config has no GitHub URL
- WHEN analysis API is called
- THEN standard analysis runs without enrichment

## ADDED Requirements

### Requirement: Analysis is not a route
The system MUST NOT register a `/app/analysis` route. Analysis renders exclusively as a child component inside UnifiedPage.

#### Scenario: Old route redirects
- GIVEN user navigates to `/app/analysis`
- WHEN React Router resolves the route
- THEN user is redirected to `/app/cv`

### Requirement: Analysis inherits auth protection
The system MUST render Analysis only within the `/app` route group, which requires authentication via AppLayout's auth guard.

#### Scenario: Unauthenticated access blocked
- GIVEN unauthenticated user visits `/app/cv`
- WHEN AppLayout auth guard fires
- THEN user is redirected to login; Analysis never renders

## REMOVED Requirements

### Requirement: Expose analysis loading and failure states
(Reason: Loading and failure states are now managed by UnifiedPage. AnalysisFeature still shows internal states but UnifiedPage coordinates the per-API error messages.)
(Migration: Move loading/error state management to UnifiedPage. AnalysisFeature retains internal rendering of its own error/success states.)

## Unchanged Requirements
The following requirements from the main spec remain unchanged: Keep LinkedIn manual-only, Produce structured analysis output, Outreach export actions, Preserve existing clipboard copy behavior, Surface detected GitHub stack, Preserve core analysis when GitHub fails, Preserve quality targets for the module.
