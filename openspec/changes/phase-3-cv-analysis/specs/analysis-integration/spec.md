# Analysis Integration Specification

## Purpose
Embed AnalysisFeature as a child component below CV preview in the unified page. Reuse existing `AnalysisResultView` unchanged.

## Requirements

### Requirement: Analysis receives config from parent
The system MUST pass JD text and tone as props to AnalysisFeature from UnifiedPage state. AnalysisFeature MUST NOT own its own JD input form.

#### Scenario: Analysis renders with parent-provided JD
- GIVEN UnifiedPage has JD + tone in state
- WHEN GENERATE triggers analysis API call
- THEN AnalysisFeature receives JD/tone from parent, not from its own form state

#### Scenario: Analysis does not render standalone form
- GIVEN AnalysisFeature is rendered inside UnifiedPage
- WHEN component mounts
- THEN no JD textarea or submit button is rendered inside AnalysisFeature

### Requirement: AnalysisResultView reuse
The system MUST reuse `AnalysisResultView` component as-is for rendering Analysis output.

#### Scenario: Analysis result renders
- GIVEN analysis API returns valid data
- WHEN UnifiedPage passes data to AnalysisResultView
- THEN summary, skills matrix, keywords, gaps, and outreach panels render

### Requirement: Analysis inherits auth from UnifiedPage
The system MUST render Analysis only when the user is authenticated via UnifiedPage's `/app` route protection.

#### Scenario: Analysis protected
- GIVEN unauthenticated user navigates to `/app/cv`
- WHEN AppLayout auth guard fires
- THEN user is redirected to login; Analysis never renders

#### Scenario: Analysis accessible when authenticated
- GIVEN authenticated user on `/app/cv`
- WHEN GENERATE completes with analysis data
- THEN Analysis panels render below CV preview
