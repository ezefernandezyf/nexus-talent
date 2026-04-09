# UI Specification for Landing & Auth

## Purpose
Define the visual and functional requirements for the new Landing, LoginPage, and SignupPage based on the Stitch HTML reference.

## Requirements

### Requirement: Landing Page Layout
The system MUST render a responsive landing page following the structure defined in `docs/assets/referenciaLanding.html`. It SHALL include semantic sections (Hero, Features, CTA).

#### Scenario: User visits the root URL
- GIVEN a visitor to the root URL `/`
- WHEN the page loads
- THEN the `LandingPage` component is rendered
- AND the "Login" button points to `/login`
- AND the "Registrarse" style CTA points to `/signup`

### Requirement: Login and Signup Form Verification
The system MUST implement client-side validation using Zod for the email and password fields before invoking the `AuthProvider`.

#### Scenario: User submits empty form
- GIVEN the user is on `/login` or `/signup`
- WHEN the user attempts to submit without an email or password
- THEN inline validation errors MUST display indicating required fields.
- AND the system MUST NOT call the `AuthProvider` methods.

#### Scenario: User submits valid credentials
- GIVEN a valid email and password format
- WHEN the user submits the form
- THEN the system MUST invoke `signIn` (or `signUp`) on the context.
- AND the UI MUST show a loading state while awaiting the response.

### Requirement: Authentication Redirection
The system SHALL respect the `AuthContext` status and redirect accordingly.

#### Scenario: Authenticated user visits public pages
- GIVEN the `AuthContext` status is `authenticated`
- WHEN the user attempts to visit `/login` or `/signup`
- THEN the system MUST redirect the user to the private shell (e.g., `/dashboard` or `/analysis`).
