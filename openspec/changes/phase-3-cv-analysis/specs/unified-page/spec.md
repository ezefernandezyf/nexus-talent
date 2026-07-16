# Unified Page Specification

## Purpose
Single page at `/app/cv` that replaces both CV and Analysis standalone routes. Users paste a JD once, configure CV sections, and generate both outputs in parallel via a single button.

## Requirements

### Requirement: Vertical stack layout
The page MUST render a vertical stack: config panel → GENERATE button → results (CV preview/export → Analysis panels).

| Section | Position | Content |
|---------|----------|---------|
| Config | Top | JD textarea, tone selector, ad-hoc items form, section order editor |
| Trigger | Middle | GENERATE button |
| Results | Bottom | CV preview with export buttons, then Analysis panels (summary, skills, keywords, gaps, outreach) |

#### Scenario: Happy path
- GIVEN JD textarea has ≥30 chars and tone is selected
- WHEN user clicks GENERATE
- THEN CV preview and Analysis panels render below in vertical order

#### Scenario: Empty JD blocked
- GIVEN JD textarea is empty or <30 chars
- WHEN user clicks GENERATE
- THEN submission is blocked with validation message

### Requirement: Parallel API calls
The system MUST fire `POST /api/cv/generate` and `POST /api/ai/analyze` via `Promise.all` when GENERATE is clicked.

#### Scenario: Both succeed
- GIVEN valid config
- WHEN both APIs return 200
- THEN CV preview and Analysis panels render simultaneously

#### Scenario: CV API fails, Analysis succeeds
- GIVEN valid config
- WHEN CV API returns error
- THEN CV section shows error message, Analysis panels render normally

#### Scenario: Analysis API fails, CV succeeds
- GIVEN valid config
- WHEN Analysis API returns error
- THEN Analysis section shows error message, CV preview renders normally

#### Scenario: Both APIs fail
- GIVEN valid config
- WHEN both APIs return errors
- THEN unified error state with per-API detail and "try again" guidance

### Requirement: UX state coverage
The system MUST handle Loading, Success, Error, and Empty states for every async process.

#### Scenario: Loading state
- GIVEN GENERATE clicked
- WHEN APIs are pending
- THEN per-section skeleton placeholders render (CV skeleton, Analysis skeleton)

#### Scenario: Re-generation clears previous results
- GIVEN previous results on screen
- WHEN user clicks GENERATE again
- THEN previous results are replaced with loading skeletons, then new results

#### Scenario: No ad-hoc items
- GIVEN user clicks GENERATE without filling ad-hoc items
- WHEN CV API returns
- THEN CV preview shows default sections only
