# Delta for UI Shell

## ADDED Requirements

### Requirement: Landing Brand Home Navigation

The public landing header MUST expose the Nexus Talent brand as a navigation link to `/`.
The brand MUST remain present as the landing entry point on desktop and mobile viewports.

#### Scenario: User clicks the brand on the landing page
- GIVEN the user is on `/`
- WHEN the user clicks the Nexus Talent brand in the header
- THEN the browser MUST navigate to `/`
- AND the landing page MUST remain the public home entry point

#### Scenario: User revisits the brand from a nested public route
- GIVEN the user is on a public route such as `/privacy`
- WHEN the user clicks the Nexus Talent brand in the header
- THEN the browser MUST navigate to `/`

### Requirement: Shell Navigation Remains Reachable on Mobile

The system MUST keep the mobile navigation drawer available from the landing page and authenticated shell.
The drawer MUST continue to expose the primary routes without changing existing route targets or authentication behavior.

#### Scenario: Public visitor opens the mobile menu
- GIVEN the user is on the landing page in a mobile viewport
- WHEN the user opens the mobile menu
- THEN the drawer MUST show the public entry points for the site
- AND the user MUST be able to reach sign-in, sign-up, and analysis routes

#### Scenario: Authenticated user opens the app shell navigation
- GIVEN the user is on an authenticated app route in a mobile viewport
- WHEN the user opens the mobile menu
- THEN the drawer MUST show the app navigation routes
- AND the current authenticated shell behavior MUST remain unchanged

## MODIFIED Requirements

### Requirement: Mobile Drawer Navigation

The system MUST provide a slide-out drawer containing navigation links when the hamburger menu is activated.
The drawer MUST be available from both the public landing page and the app shell, and closing the drawer MUST continue to restore normal page interaction.

(Previously: The drawer requirement described availability and route reachability, but did not explicitly preserve closing behavior or the public brand-home navigation boundary.)

#### Scenario: User closes navigation
- GIVEN the mobile drawer is open
- WHEN the user clicks a navigation link OR the backdrop
- THEN the drawer MUST close
- AND the user MUST be navigated to the selected route (if a link was clicked)

#### Scenario: Drawer does not change shell behavior
- GIVEN the user is using the public landing page or authenticated shell
- WHEN the drawer opens and closes
- THEN the current route targets MUST remain the same
- AND no theme or visual-parity behavior MUST be introduced by this module