# Delta for Landing Mobile and Drawer Cleanup

## ADDED Requirements

### Requirement: Landing Mobile Layout Must Stay in Flow

The landing page MUST remain readable on narrow viewports without the features section overlapping its own follow-up cards or text.

#### Scenario: User scrolls the landing page on mobile
- GIVEN the user opens the landing page on a narrow viewport
- WHEN they scroll into the features section
- THEN the "Arquitectura de Decisión" column MUST not overlap the cards below it
- AND the section MUST remain readable in a single vertical flow

#### Scenario: User opens the landing page on desktop
- GIVEN the user opens the landing page on a wide viewport
- WHEN the features section renders
- THEN the existing split layout MAY remain sticky on desktop
- AND the visual hierarchy MUST remain intact

### Requirement: Public Drawer Must Be User Facing

The public mobile drawer MUST present only user-facing navigation and actions.
Developer-facing labels MUST NOT be visible.

#### Scenario: User opens the mobile drawer
- GIVEN the user opens the public drawer on mobile
- WHEN the drawer renders
- THEN the drawer heading and labels MUST be user-facing
- AND no developer-only wording such as "Mobile drawer" MUST be shown

#### Scenario: Drawer actions render
- GIVEN the public drawer is open
- WHEN the auth actions are shown
- THEN the navigation items and auth actions MUST not be duplicated in a confusing way
- AND the ordering MUST remain easy to scan

## MODIFIED Requirements

### Requirement: Public Landing Navigation

The system MUST keep the landing navigation simple, readable, and consistent across breakpoints while preserving the current routes.

#### Scenario: The brand link is used
- GIVEN the user clicks the Nexus Talent brand on the landing page
- WHEN the link is activated
- THEN the user MUST return to the homepage
- AND the route MUST remain unchanged from the public landing entry point

## Acceptance Criteria
- The landing features section does not overlap on mobile.
- The public mobile drawer contains only user-facing copy.
- The drawer navigation and auth actions remain clear and non-duplicated.