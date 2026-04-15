# Public Pages Specification

## Purpose
Ensure the public-facing pages and shared footer remain reachable and linked correctly.

## Requirements

### Requirement: Privacy Page Availability
The system MUST expose a public privacy page at `/privacy`.

#### Scenario: User opens privacy
- GIVEN a visitor navigates to `/privacy`
- WHEN the page loads
- THEN the privacy content MUST render
- AND the page MUST provide a route back to the home entry point

### Requirement: 404 Page Availability
The system MUST expose a public not-found page at `/404` and use it for unknown routes.

#### Scenario: User opens an unknown route
- GIVEN a visitor requests a route that does not exist
- WHEN the router resolves the location
- THEN the system MUST show the 404 page
- AND the page MUST provide a way to return to the home entry point

### Requirement: Shared Footer Privacy Link
The shared footer MUST provide a visible link to the privacy page.

#### Scenario: Footer renders on public pages
- GIVEN the landing page renders the shared footer
- WHEN the footer is visible
- THEN it MUST include a link to `/privacy`

#### Scenario: Footer renders in the authenticated shell
- GIVEN the app shell renders the shared footer
- WHEN the footer is visible
- THEN it MUST include a link to `/privacy`

## Acceptance Criteria
- Public privacy and 404 pages remain reachable through the router.
- The footer privacy link is covered directly at component level.
- No new public routes are introduced.