# Delta for UI Shell

## Exclusions
This change does not implement the settings rewrite, history redesign, or legacy cleanup.

## ADDED Requirements

### Requirement: Landing CTA Wiring
The landing primary CTA MUST route to the existing auth entry point.

#### Scenario: Visitor clicks the landing CTA
- GIVEN a visitor is on the landing page
- WHEN the visitor clicks the primary CTA
- THEN the system MUST navigate to the sign-up or login entry route used by the current auth flow

### Requirement: Navbar Logo Home Navigation
The navbar logo MUST navigate to the application home route.

#### Scenario: User clicks the logo
- GIVEN the user is anywhere in the public or authenticated shell
- WHEN the user clicks the Nexus Talent logo
- THEN the system MUST navigate to the home route
- AND the current shell state MUST remain intact

### Requirement: Public Legal and Fallback Routes
The system MUST provide a privacy route and a not-found route for unknown URLs.

#### Scenario: User opens privacy
- GIVEN the user visits the privacy URL
- WHEN the route resolves
- THEN a privacy page MUST render successfully

#### Scenario: User visits an unknown route
- GIVEN the user enters an unrecognized URL
- WHEN the router resolves the path
- THEN the system MUST render a 404 page
- AND the user MUST have a clear path back to home

### Requirement: Minimal Theme Persistence
The system SHOULD preserve the current theme choice across reloads when a theme toggle is already in use, but MUST NOT introduce broader settings persistence.

#### Scenario: User reloads after changing theme
- GIVEN the user previously switched theme
- WHEN the app reloads
- THEN the current theme choice SHOULD be restored
- AND navigation and auth actions MUST still work if persistence is unavailable