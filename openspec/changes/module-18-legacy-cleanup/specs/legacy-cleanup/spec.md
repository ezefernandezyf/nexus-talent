# Legacy Cleanup Specification

## Purpose
Remove unused legacy landing code without changing the active public landing behavior.

## Requirements

### Requirement: Remove Unused Legacy Landing Tree
The system MUST not retain the obsolete landing implementation under `src/features/landing/*` once the active landing tree is confirmed as the source of truth.

#### Scenario: Cleanup is performed
- GIVEN the active landing page is routed through `src/pages/LandingPage.tsx`
- WHEN the cleanup runs
- THEN the legacy landing files MUST no longer be part of the active source tree
- AND the active landing implementation MUST remain intact

### Requirement: Preserve Active Landing Behavior
The system MUST continue to render the current landing page, navigation, and footer behavior after legacy cleanup.

#### Scenario: Visitor opens the root URL
- GIVEN a visitor loads `/`
- WHEN the app renders
- THEN the active landing page MUST still appear
- AND the existing landing links MUST continue to work

#### Scenario: Visitor uses the router
- GIVEN a visitor navigates through public routes
- WHEN the router resolves `/`, `/privacy`, or `/404`
- THEN the current route behavior MUST remain unchanged

## Acceptance Criteria
- The unused `src/features/landing/*` tree is removed.
- The active landing page and router behavior remain unchanged.
- Existing landing and router tests continue to pass.