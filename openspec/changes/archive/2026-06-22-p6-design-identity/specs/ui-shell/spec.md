# Delta for UI Shell

## MODIFIED Requirements

### Requirement: AppLayout Token Migration
The `AppLayout` MUST use OKLCH design tokens for backgrounds, borders, and typography. The header, sidebar, and content area SHALL reference CSS custom properties — zero HEX hardcodes.
(Previously: AppLayout used hardcoded HEX color values.)

#### Scenario: Authenticated user views the app shell
- GIVEN the user is authenticated
- WHEN any app page renders inside AppLayout
- THEN the shell uses OKLCH tokens for all visual properties
- AND the dark theme is active by default

### Requirement: Navigation Design Identity
The main navigation (desktop sidebar + mobile drawer) MUST reflect the new design identity: Cabinet Grotesk for nav labels, OKLCH accent colors for active states, and the Signal design language.
(Previously: Navigation used Inter/Space Grotesk with HEX colors.)

#### Scenario: User navigates between sections
- GIVEN the user is on any app page
- WHEN they view the navigation
- THEN active nav items use OKLCH accent color
- AND nav labels render in the design system font

### Requirement: Mobile Drawer Content Update
The mobile drawer content MUST match the new landing page copy and design identity. Developer-facing labels MUST NOT be visible.
(Previously: Drawer content was updated in a prior delta to remove dev labels; now content itself changes.)

#### Scenario: Public visitor opens mobile drawer
- GIVEN a visitor opens the drawer on mobile from the landing page
- WHEN the drawer renders
- THEN nav items reflect the new landing content sections
- AND auth actions use updated copy matching the redesign

### Requirement: Footer Update
The footer MUST use OKLCH tokens and reflect the new design identity. Copyright text and layout SHALL match the typography scale.
(Previously: Footer used hardcoded styles.)

#### Scenario: User scrolls to footer
- GIVEN the user is on any page
- WHEN they scroll to the bottom
- THEN the footer renders with OKLCH token colors
- AND typography matches the Satoshi body font at the caption scale
