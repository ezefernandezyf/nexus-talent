# UX Resilience Specification

## Purpose

Define production-grade resilience states: server error page with recovery, skeleton loading on settings, and empty-state guidance on analysis before first run. Extends the "every async process must handle Loading/Success/Error/Empty" convention.

## Requirements

### Requirement: Server Error Page at /500

The system MUST render a dedicated error page at `/500` when an unhandled rendering exception is caught by ErrorBoundary. The page MUST display a user-facing message and a retry action.

#### Scenario: Component crash triggers 500 page

- GIVEN a React component throws an unhandled rendering error
- WHEN ErrorBoundary catches the error
- THEN the system SHALL navigate to `/500`
- AND the page MUST show a friendly error message
- AND a "Recargar aplicación" button MUST reload the full app

#### Scenario: Direct navigation to /500

- GIVEN a user navigates directly to `/500`
- WHEN the page renders
- THEN the retry button MUST reload the application
- AND the page MUST NOT produce a secondary error

### Requirement: SettingsPage Skeleton Loading

The SettingsPage MUST display a skeleton placeholder while auth state is unknown or settings data is fetching. The existing LoadingSkeleton component (hero variant) SHALL be wired into the page.

#### Scenario: Settings page loading

- GIVEN the user navigates to `/app/settings`
- WHEN auth status is `unknown` or settings query is pending
- THEN SettingsPage MUST render LoadingSkeleton with variant="hero"
- AND no empty content flash MUST occur

#### Scenario: Settings page loaded

- GIVEN the user is authenticated and settings data is available
- WHEN SettingsPage renders
- THEN the skeleton MUST be replaced by live settings content
- AND the transition MUST be free of layout shift

### Requirement: AnalysisFeature Empty State

The AnalysisFeature MUST render an empty-state panel when no analysis has been submitted yet (not loading, not errored, no data). The existing EmptyState component SHALL be used with guidance copy.

#### Scenario: First visit, no analysis yet

- GIVEN the user visits `/app/analysis` for the first time
- WHEN no analysis data exists and no request is pending
- THEN the AnalysisFeature MUST render EmptyState
- AND the title MUST be "No hay análisis todavía"
- AND the description MUST guide the user to paste a job description

#### Scenario: Empty state does not appear during loading

- GIVEN the user has submitted a job description
- WHEN the analysis request is pending
- THEN the loading state MUST render instead of the empty state
