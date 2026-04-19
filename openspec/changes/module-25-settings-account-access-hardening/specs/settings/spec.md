# Settings Specification

## Purpose
Define access to personal settings for authenticated users and the account deletion action in the danger zone.

## Requirements

### Requirement: Authenticated Personal Settings Access
The system MUST allow authenticated users to access `/app/settings`.
The system MUST deny access to unauthenticated visitors.

#### Scenario: Authenticated user opens settings
- GIVEN an authenticated user
- WHEN the user navigates to `/app/settings`
- THEN the settings page MUST render
- AND the existing settings sections MUST be available

#### Scenario: Public visitor opens settings
- GIVEN a visitor without an authenticated session
- WHEN the visitor navigates to `/app/settings`
- THEN access MUST be denied or redirected to sign-in

### Requirement: Existing Settings Sections Remain Available
The system MUST keep the current settings sections visible and usable for authenticated users.

#### Scenario: User views settings content
- GIVEN an authenticated user on `/app/settings`
- WHEN the page renders
- THEN theme, export, profile, and linked-account controls MUST still be present
- AND the page MUST NOT require an admin role

### Requirement: Account Deletion from Danger Zone
The system MUST allow an authenticated user to delete their own account from the danger zone after explicit confirmation.

#### Scenario: User confirms deletion
- GIVEN an authenticated user on settings
- WHEN the user confirms account deletion
- THEN the deletion action MUST run for the current user
- AND the user MUST lose access to the authenticated session

#### Scenario: User cancels deletion
- GIVEN an authenticated user on settings
- WHEN the user dismisses the confirmation
- THEN no deletion action MUST be performed