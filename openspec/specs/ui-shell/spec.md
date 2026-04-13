# Delta for UI Shell

## ADDED Requirements

### Requirement: Mobile Hamburger Menu Button

The system MUST display a hamburger menu icon button in the header exclusively on mobile viewports (`< 768px`).
The system MUST display this button on the public landing page and on the authenticated app shell.

#### Scenario: User opens the mobile app
- GIVEN the user is on a viewport narrower than 768px
- WHEN the header renders
- THEN the hamburger menu button MUST be visible
- AND the desktop navigation links MUST be hidden

#### Scenario: Public visitor opens the site on mobile
- GIVEN the user is on the landing page in a mobile viewport
- WHEN the header renders
- THEN the hamburger menu button MUST be visible
- AND the public call-to-action links SHOULD remain reachable through the drawer

### Requirement: Mobile Drawer Navigation

The system MUST provide a slide-out drawer containing navigation links when the hamburger menu is activated.
The drawer MUST be available from both the public landing page and the app shell.

The drawer is the mobile side panel that overlays the page content and presents the same primary routes in a touch-friendly list.

#### Scenario: User opens navigation
- GIVEN the user is on a mobile viewport
- WHEN the user clicks the hamburger menu button
- THEN a drawer MUST slide in from the edge
- AND a semi-transparent backdrop MUST cover the main content
- AND the drawer MUST contain links to the application routes (Análisis, Historial, Settings)

#### Scenario: Public visitor opens navigation
- GIVEN the user is on the landing page on mobile
- WHEN the user clicks the hamburger menu button
- THEN the drawer MUST include the public entry points for the site
- AND the user MUST be able to reach the app and authentication screens

#### Scenario: User closes navigation
- GIVEN the mobile drawer is open
- WHEN the user clicks a navigation link OR the backdrop
- THEN the drawer MUST close
- AND the user MUST be navigated to the selected route (if a link was clicked)

### Requirement: Global Footer

The system MUST display a global footer at the bottom of the application layouts.
The footer MUST be available to any user who visits the site, including public and authenticated users.

#### Scenario: User scrolls to the bottom
- GIVEN the user is on any main application page or the landing page
- WHEN the user scrolls to the bottom of the content
- THEN a footer containing copyright information ("© 2026 Nexus Talent — Precision Recruiting Layer") MUST be visible

#### Scenario: User visits the site without signing in
- GIVEN the user is browsing the public site
- WHEN the landing page or app shell renders
- THEN the footer MUST be visible without requiring authentication
- AND the mobile menu MUST remain available on mobile viewports

## MODIFIED Requirements

### Requirement: Desktop Sidebar Content

The sidebar MUST NOT display technical implementation details or internal developer notes.
(Previously: The sidebar displayed notes like "Shell compartido", "Historial local habilitado").

#### Scenario: User views the desktop sidebar
- GIVEN the user is on a desktop viewport (`>= 1024px`)
- WHEN the sidebar is rendered
- THEN the navigation links MUST be visible
- AND no technical implementation text MUST be present