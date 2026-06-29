# UI Specification

## Purpose
Define the visual and functional requirements for the UI component library, including landing page, auth pages, and reusable components. Components MUST use OKLCH design tokens and cn() for class merging.

## Requirements

### Requirement: Landing Page Layout
The system MUST render a responsive landing page with structured content (H1, H2 answer blocks, FAQ). The layout SHALL use OKLCH design tokens, Cabinet Grotesk + Satoshi typography, and dark-first theme.

#### Scenario: User visits the root URL
- GIVEN a visitor to the root URL `/`
- WHEN the page loads
- THEN the landing renders with Cabinet Grotesk headings and OKLCH colors
- AND the "Login" button points to `/login`
- AND the CTA points to `/signup`

### Requirement: Login and Signup Form Verification
The system MUST implement client-side Zod validation and use components styled with OKLCH tokens and `cn()` for class merging.

#### Scenario: User submits empty form
- GIVEN the user is on `/login` or `/signup`
- WHEN the user attempts to submit without an email or password
- THEN inline validation errors MUST display indicating required fields
- AND the system MUST NOT call the auth service methods

#### Scenario: User submits valid credentials
- GIVEN a valid email and password format
- WHEN the user submits the form
- THEN the system invokes `signIn` or `signUp` on the auth context
- AND the UI shows a loading state while awaiting the response

### Requirement: Authentication Redirection
The system SHALL respect the `AuthContext` status and redirect accordingly.

#### Scenario: Authenticated user visits public pages
- GIVEN the `AuthContext` status is `authenticated`
- WHEN the user attempts to visit `/login` or `/signup`
- THEN the system MUST redirect the user to the private shell (e.g., `/dashboard` or `/analysis`)

### Requirement: Badge Component
The system MUST provide a `Badge` component supporting variant (info, success, warning, error) and size (sm, md) props, styled with OKLCH design tokens.

#### Scenario: Badge renders with variant
- GIVEN a `<Badge variant="success">Complete</Badge>`
- WHEN the component renders
- THEN it displays with the correct OKLCH background and text colors

### Requirement: OKLCH Token Usage in Components
All UI components (Button, Card, Input, Modal, Badge) MUST reference OKLCH CSS custom properties - zero HEX hardcodes. Components MUST use `cn()` for class merging.

#### Scenario: Button uses OKLCH tokens
- GIVEN a `<Button variant="primary">`
- WHEN the component renders
- THEN its background, text, and border colors derive from OKLCH custom properties
- AND no HEX color value appears in the component source

### Requirement: WCAG 2.2 AA Accessibility
All interactive components MUST meet WCAG 2.2 AA: visible focus indicators, color contrast ≥ 4.5:1 for normal text, and `prefers-reduced-motion` support disabling all animations.

#### Scenario: Keyboard navigation with visible focus
- GIVEN a user navigates via Tab key
- WHEN focus lands on a Button, Input, or Modal trigger
- THEN a visible focus indicator appears
- AND contrast ratio meets 4.5:1 minimum

#### Scenario: Reduced motion preference
- GIVEN the user has `prefers-reduced-motion: reduce` set
- WHEN any component with animations renders
- THEN all animations and transitions are disabled
