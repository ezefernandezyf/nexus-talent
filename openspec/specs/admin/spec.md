# Admin & Settings Specification

## Purpose
Defines the behavior for the application settings management and the administrator role requirements.

## Requirements

### Requirement: Admin Role Identification
The system MUST identify whether an authenticated user holds the `admin` role.

#### Scenario: User is an administrator
- GIVEN an authenticated user session
- AND the user metadata or roles data indicates `role: 'admin'`
- WHEN the user role is evaluated
- THEN the system MUST return `isAdmin: true`

#### Scenario: User is a standard user
- GIVEN an authenticated user session
- AND the user metadata or roles data indicates a standard role or is empty
- WHEN the user role is evaluated
- THEN the system MUST return `isAdmin: false`

### Requirement: Admin Route Protection
The system MUST restrict access to `/app/admin/*` routes to administrators only.

#### Scenario: Allowed admin access
- GIVEN a user with `isAdmin: true`
- WHEN the user navigates to `/app/admin/settings`
- THEN the system MUST allow rendering of the settings view

#### Scenario: Denied standard access
- GIVEN a user with `isAdmin: false`
- WHEN the user navigates to `/app/admin/settings`
- THEN the system MUST redirect the user to `/app` (or explicitly deny access with a message)

### Requirement: Settings Persistence
The system MUST allow retrieving and updating application-wide settings from a Supabase `settings` table.

#### Scenario: Fetching current settings
- GIVEN an authenticated `admin` user
- WHEN the user requests current settings
- THEN the system MUST query the `settings` table and return the stored JSON payload
- AND fallback to a default configuration if the table is empty

#### Scenario: Updating settings successfully
- GIVEN an authenticated `admin` user
- WHEN the user submits a valid settings payload
- THEN the system MUST persist the changes to the `settings` table
- AND return a success confirmation

### Requirement: Settings Validation
The system MUST validate all settings payloads against a predefined schema.

#### Scenario: Invalid settings payload
- GIVEN an authenticated `admin` user
- WHEN the user submits a settings payload with missing or malformed data
- THEN the system MUST reject the update
- AND the UI MUST display a validation error detailing the invalid fields
