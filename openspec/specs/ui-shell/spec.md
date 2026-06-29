# UI Shell Specification

## Purpose
Define the layout shell, navigation, and shared UI chrome including the app layout, sidebar, mobile drawer, and footer. All components MUST use OKLCH design tokens and the Signal design identity.

## Requirements

### Requirement: AppLayout Token Migration
The `AppLayout` MUST use OKLCH design tokens for backgrounds, borders, and typography. The header, sidebar, and content area SHALL reference CSS custom properties - zero HEX hardcodes.

#### Scenario: Authenticated user views the app shell
- GIVEN the user is authenticated
- WHEN any app page renders inside AppLayout
- THEN the shell uses OKLCH tokens for all visual properties
- AND the dark theme is active by default

### Requirement: Desktop Sidebar Content
The sidebar MUST NOT display technical implementation details or internal developer notes.

#### Scenario: User views the desktop sidebar
- GIVEN the user is on a desktop viewport (`>= 1024px`)
- WHEN the sidebar is rendered
- THEN the navigation links MUST be visible
- AND no technical implementation text MUST be present

### Requirement: Navigation Design Identity
The main navigation (desktop sidebar + mobile drawer) MUST reflect the Signal design identity: Cabinet Grotesk for nav labels, OKLCH accent colors for active states.

#### Scenario: User navigates between sections
- GIVEN the user is on any app page
- WHEN they view the navigation
- THEN active nav items use OKLCH accent color
- AND nav labels render in Cabinet Grotesk font

### Requirement: Mobile Hamburger Menu Button
The system MUST display a hamburger menu icon button in the header exclusively on mobile viewports (`< 768px`). The system MUST display this button on the public landing page and on the authenticated app shell.

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
The system MUST provide a slide-out drawer containing navigation links when the hamburger menu is activated. The drawer MUST be available from both the public landing page and the app shell. The drawer content MUST match the current copy and design identity with no developer-facing labels visible.

#### Scenario: User opens navigation
- GIVEN the user is on a mobile viewport
- WHEN the user clicks the hamburger menu button
- THEN a drawer MUST slide in from the edge
- AND a semi-transparent backdrop MUST cover the main content
- AND the drawer MUST contain links to the application routes

#### Scenario: Public visitor opens navigation
- GIVEN the user is on the landing page on mobile
- WHEN the user clicks the hamburger menu button
- THEN the drawer MUST include the public entry points for the site
- AND nav items reflect the current landing content sections
- AND auth actions use updated copy matching the redesign

#### Scenario: User closes navigation
- GIVEN the mobile drawer is open
- WHEN the user clicks a navigation link OR the backdrop
- THEN the drawer MUST close
- AND the user MUST be navigated to the selected route (if a link was clicked)

### Requirement: Global Footer
The system MUST display a global footer at the bottom of the application layouts. The footer MUST use OKLCH tokens and reflect the Signal design identity. Copyright text and layout SHALL match the typography scale.

#### Scenario: User scrolls to the bottom
- GIVEN the user is on any main application page or the landing page
- WHEN the user scrolls to the bottom of the content
- THEN a footer containing copyright information MUST be visible
- AND the footer renders with OKLCH token colors
- AND typography matches the Satoshi body font at the caption scale

#### Scenario: User visits the site without signing in
- GIVEN the user is browsing the public site
- WHEN the landing page or app shell renders
- THEN the footer MUST be visible without requiring authentication
- AND the mobile menu MUST remain available on mobile viewports
