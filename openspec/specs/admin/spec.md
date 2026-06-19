# Admin & Settings Specification

## Purpose
Defines the behavior for the application settings management.

> **Note**: Admin Role Identification (REQ-ADM-001) and Admin Route Protection (REQ-ADM-002) were removed in P5 Frontend Refactor. The backend no longer returns a `role` field in GET /api/auth/me. The `/app/admin` route and AdminRoute component were deleted. See `P5 Frontend Refactor` archive for details.

## Requirements

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
