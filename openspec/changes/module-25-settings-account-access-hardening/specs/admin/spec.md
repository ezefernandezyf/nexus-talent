# Delta for Admin

## MODIFIED Requirements

### Requirement: Admin Route Protection
The system MUST restrict `/app/admin/*` routes to administrators only.
Previously: `/app/admin/settings` was the entry point for personal settings.

#### Scenario: Admin route remains protected
- GIVEN a non-admin authenticated user
- WHEN the user navigates to an admin route
- THEN access MUST be denied or redirected away from the admin area

#### Scenario: Settings route moved out of admin
- GIVEN an authenticated user
- WHEN the user navigates to `/app/admin/settings`
- THEN the system MUST NOT present personal settings as an admin feature
- AND the user MUST be directed to `/app/settings`

## REMOVED Requirements

### Requirement: Settings Persistence
(Reason: personal settings are no longer owned by the admin surface; the user settings surface now owns the access path.)

### Requirement: Settings Validation
(Reason: admin-only settings validation is no longer part of this change.)