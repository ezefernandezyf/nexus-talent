# Auth Specification

## Purpose

Manage user authentication, session state, and basic secure routing using Supabase Auth.

## Requirements

### Requirement: User Registration

The system MUST allow users to register using an email and password.

#### Scenario: Successful Registration

- GIVEN a valid email and a strong password
- WHEN the user submits the registration form
- THEN the system creates a new user account in Supabase
- AND the user receives a confirmation message
- AND the user is securely logged in or prompted to verify their email depending on Supabase configuration.

#### Scenario: Registration with Existing Email

- GIVEN an email that is already registered
- WHEN the user submits the registration form
- THEN the system displays a clear error message indicating the email is in use.

### Requirement: User Authentication

The system MUST allow registered users to authenticate and establish a secure session.

#### Scenario: Successful Login

- GIVEN valid user credentials
- WHEN the user submits the login form
- THEN the system authenticates the user via Supabase
- AND establishes an active session securely
- AND redirects the user to their protected dashboard/history area.

#### Scenario: Invalid Login

- GIVEN invalid or incorrect credentials
- WHEN the user submits the login form
- THEN the system displays an "Invalid credentials" error message
- AND does not authenticate the user.

### Requirement: Session Management

The system MUST maintain the user's session securely across browser reloads.

#### Scenario: Persistent Session on Reload

- GIVEN an authenticated user with an active session
- WHEN the user reloads the page
- THEN the system eagerly restores the session state using Supabase Auth without requiring re-authentication.

#### Scenario: Logout

- GIVEN an authenticated user
- WHEN the user clicks the logout button
- THEN the system terminates the Supabase session
- AND clears any local session state managed by the `AuthProvider`
- AND redirects the user to the public landing page or login screen.

### Requirement: Route Protection

The system MUST prevent unauthorized access to private routes.

#### Scenario: Accessing Protected Route Unauthenticated

- GIVEN an unauthenticated user
- WHEN the user attempts to directly access a private route
- THEN the system intercepts the request and redirects the user to the login page.

#### Scenario: Accessing Protected Route Authenticated

- GIVEN an authenticated user
- WHEN the user accesses a private route
- THEN the system successfully renders the requested page content.